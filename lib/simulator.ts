import {
    Connection,
    Transaction,
    VersionedTransaction,
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
        if (message.addressTableLookups && message.addressTableLookups.length > 0) {
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
    } catch {
    }

    const instructions: TransactionInstruction[] = message.compiledInstructions.map((ci) => {
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

    return instructions;
}

export async function simulateFromBase64(base64Tx: string): Promise<SimulationResult> {
    const cleaned = base64Tx.replace(/\s/g, '');

    let buffer: Buffer;
    try {
        buffer = Buffer.from(cleaned, 'base64');
        if (buffer.length < 10) throw new Error('Transaction too short — likely malformed base64');
    } catch (e: any) {
        throw new Error(`Could not decode base64: ${e.message}`);
    }

    try {
        const versioned = VersionedTransaction.deserialize(buffer);
        const sim = await connection.simulateTransaction(versioned, {
            commitment: 'confirmed',
            replaceRecentBlockhash: true,
            innerInstructions: true,
        });
        const instructions = await extractInstructionsFromVersioned(versioned);
        return buildResult(sim, instructions);
    } catch {
    }

    try {
        const legacy = Transaction.from(buffer);
        if (!legacy.recentBlockhash) {
            legacy.recentBlockhash = '11111111111111111111111111111111';
        }
        const message = legacy.compileMessage();
        const versionedFromLegacy = new VersionedTransaction(message);
        const sim = await connection.simulateTransaction(versionedFromLegacy, {
            commitment: 'confirmed',
            replaceRecentBlockhash: true,
        });
        return buildResult(sim, legacy.instructions);
    } catch (e: any) {
        throw new Error(`Simulation failed: ${e.message}`);
    }
}

async function buildResult(
    sim: Awaited<ReturnType<Connection['simulateTransaction']>>,
    extractedInstructions: TransactionInstruction[]
): Promise<SimulationResult> {
    const value = sim.value;
    const logs = value.logs ?? [];
    const computeUnits = value.unitsConsumed ?? 0;

    let error: string | null = null;
    if (value.err) {
        error = typeof value.err === 'string' ? value.err : JSON.stringify(value.err);
    }

    const simulationFailed = !!value.err;
    const decoded = decodeInstructions(extractedInstructions);
    const cpiTree = buildCPITree(logs);
    const riskAnalysis = analyzeRisk(decoded, logs, computeUnits);

    // Pass error to both so stale detection works correctly in each
    const warnings = generateWarnings(decoded, riskAnalysis, simulationFailed, error);
    const humanSummary = generateHumanSummary(decoded, logs, simulationFailed, error);

    const accountChanges: AccountChange[] = (value.accounts ?? [])
        .filter(Boolean)
        .map((acc, idx) => ({
            pubkey: `account_${idx}`,
            before: { lamports: 0, owner: acc!.owner },
            after: { lamports: acc!.lamports, owner: acc!.owner },
            ownerChanged: false,
            isClosed: acc!.lamports === 0,
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
