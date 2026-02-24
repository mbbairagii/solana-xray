import {
    Connection,
    VersionedTransaction,
    VersionedMessage,
    Transaction,
    TransactionInstruction,
    PublicKey,
} from '@solana/web3.js';
import { SimulationResult, AccountChange } from './types';
import { decodeInstructions, buildCPITree } from './instructionParser';
import { analyzeRisk, generateWarnings, generateHumanSummary } from './riskEngine';

const RPC_ENDPOINT =
    process.env.NEXT_PUBLIC_RPC_URL ?? 'https://api.mainnet-beta.solana.com';

export const connection = new Connection(RPC_ENDPOINT, 'confirmed');

async function extractInstructionsFromVersioned(
    tx: VersionedTransaction
): Promise<TransactionInstruction[]> {
    const message = tx.message;
    const accountKeys = message.staticAccountKeys;
    let allKeys = [...accountKeys];

    try {
        if (message.addressTableLookups?.length > 0) {
            const altAccounts = await Promise.all(
                message.addressTableLookups.map((lookup) =>
                    connection.getAddressLookupTable(lookup.accountKey)
                )
            );
            for (const altResult of altAccounts) {
                if (altResult.value) {
                    allKeys = [...allKeys, ...altResult.value.state.addresses];
                }
            }
        }
    } catch { }

    return message.compiledInstructions.map((ci) => {
        const programId = allKeys[ci.programIdIndex];
        const accounts = ci.accountKeyIndexes.map((idx) => ({
            pubkey: allKeys[idx] ?? new PublicKey('11111111111111111111111111111111'),
            isSigner: false,
            isWritable: true,
        }));
        return new TransactionInstruction({
            programId: programId ?? new PublicKey('11111111111111111111111111111111'),
            keys: accounts,
            data: Buffer.from(ci.data),
        });
    });
}

async function simulateViaRPC(base64Tx: string): Promise<any> {
    const res = await fetch(RPC_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'simulateTransaction',
            params: [
                base64Tx,
                {
                    encoding: 'base64',
                    commitment: 'confirmed',
                    replaceRecentBlockhash: true,
                    innerInstructions: true,
                    sigVerify: false,
                },
            ],
        }),
    });

    const json = await res.json();

    if (json.error) {
        const msg: string = json.error.message ?? '';
        if (msg.includes('address table') || msg.includes('AddressLookupTable')) {
            return {
                value: {
                    err: 'AddressLookupTableNotFound',
                    logs: [],
                    unitsConsumed: 0,
                    accounts: null,
                },
            };
        }
        throw new Error(msg || 'RPC error');
    }

    return json.result;
}

async function checkOnChainStatus(signature: string): Promise<SimulationResult | null> {
    try {
        const res = await fetch(RPC_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'getTransaction',
                params: [signature, { encoding: 'base64', maxSupportedTransactionVersion: 0 }],
            }),
        });
        const json = await res.json();
        const tx = json?.result;
        if (!tx) return null;

        const onChainErr = tx.meta?.err;
        if (onChainErr) return null;

        const logs: string[] = tx.meta?.logMessages ?? [];
        const computeUnits: number = tx.meta?.computeUnitsConsumed ?? 0;
        const base64 = tx.transaction?.[0];

        let extractedInstructions: TransactionInstruction[] = [];
        if (base64) {
            try {
                const buffer = Buffer.from(base64, 'base64');
                const sigCount = buffer[0];
                const messageBytes = buffer.slice(1 + sigCount * 64);
                const message = VersionedMessage.deserialize(messageBytes);
                const versioned = new VersionedTransaction(message);
                extractedInstructions = await extractInstructionsFromVersioned(versioned);
            } catch {
                try {
                    const buffer = Buffer.from(base64, 'base64');
                    const legacy = Transaction.from(buffer);
                    extractedInstructions = legacy.instructions;
                } catch { }
            }
        }

        const decoded = decodeInstructions(extractedInstructions);
        const cpiTree = buildCPITree(logs);

        return {
            success: false,
            logs,
            computeUnitsUsed: computeUnits,
            error: 'ConfirmedOnChain',
            accounts: [],
            instructions: decoded,
            cpiTree,
            riskAnalysis: { score: 0, level: 'safe', factors: [], heuristics: [] },
            humanSummary: 'This transaction was confirmed on-chain. Simulation runs against current state which may differ from when it landed.',
            warnings: [],
        };
    } catch {
        return null;
    }
}


export async function simulateFromBase64(base64Tx: string, signature?: string): Promise<SimulationResult> {
    const cleaned = base64Tx.replace(/\s/g, '');

    // If we have the signature, check on-chain first
    if (signature) {
        const onChain = await checkOnChainStatus(signature);
        if (onChain) return onChain;
    }

    let buffer: Buffer;
    try {
        buffer = Buffer.from(cleaned, 'base64');
        if (buffer.length < 10) throw new Error('Transaction too short — likely malformed base64');
    } catch (e: any) {
        throw new Error(`Could not decode base64: ${e.message}`);
    }

    const result = await simulateViaRPC(cleaned);
    const value = result.value;

    let extractedInstructions: TransactionInstruction[] = [];

    try {
        const sigCount = buffer[0];
        const sigBytes = 1 + sigCount * 64;
        const messageBytes = buffer.slice(sigBytes);
        const message = VersionedMessage.deserialize(messageBytes);
        const versioned = new VersionedTransaction(message);
        extractedInstructions = await extractInstructionsFromVersioned(versioned);
    } catch {
        try {
            const legacy = Transaction.from(buffer);
            extractedInstructions = legacy.instructions;
        } catch { }
    }

    return buildResult(value, extractedInstructions);
}

async function buildResult(
    value: any,
    extractedInstructions: TransactionInstruction[]
): Promise<SimulationResult> {
    const logs: string[] = value.logs ?? [];
    const computeUnits: number = value.unitsConsumed ?? 0;

    let error: string | null = null;
    if (value.err) {
        error = typeof value.err === 'string' ? value.err : JSON.stringify(value.err);
    }

    const simulationFailed = !!value.err;
    const decoded = decodeInstructions(extractedInstructions);
    const cpiTree = buildCPITree(logs);
    const riskAnalysis = analyzeRisk(decoded, logs, computeUnits);
    const warnings = generateWarnings(decoded, riskAnalysis, simulationFailed, error);
    const humanSummary = generateHumanSummary(decoded, logs, simulationFailed, error);

    const accountChanges: AccountChange[] = (value.accounts ?? [])
        .filter(Boolean)
        .map((acc: any, idx: number) => ({
            pubkey: `account_${idx}`,
            before: { lamports: 0, owner: acc.owner },
            after: { lamports: acc.lamports, owner: acc.owner },
            ownerChanged: false,
            isClosed: acc.lamports === 0,
        }));

    return {
        success: !error,
        logs,
        computeUnitsUsed: computeUnits,
        error,
        accounts: accountChanges,
        instructions: decoded,
        cpiTree,
        riskAnalysis,
        humanSummary,
        warnings,
    };
}
