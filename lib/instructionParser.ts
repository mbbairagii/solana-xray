import {
    TransactionInstruction,
    SystemProgram,
    PublicKey,
    SystemInstruction,
} from '@solana/web3.js';
import {
    TOKEN_PROGRAM_ID,
    TOKEN_2022_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
    decodeInstruction,
    TokenInstruction,
} from '@solana/spl-token';
import { DecodedInstruction } from './types';
import { getProgramInfo } from './programRegistry';

const SYSTEM_PROGRAM_ID = SystemProgram.programId.toBase58();
const TOKEN_PROGRAM_STR = TOKEN_PROGRAM_ID.toBase58();
const TOKEN_2022_STR = TOKEN_2022_PROGRAM_ID.toBase58();
const ASSOCIATED_TOKEN_STR = ASSOCIATED_TOKEN_PROGRAM_ID.toBase58();
const COMPUTE_BUDGET_ID = 'ComputeBudget111111111111111111111111111111';

function shortKey(pk: string): string {
    return `${pk.slice(0, 4)}...${pk.slice(-4)}`;
}

function decodeSystemInstruction(ix: TransactionInstruction): Partial<DecodedInstruction> {
    try {
        const type = SystemInstruction.decodeInstructionType(ix);
        switch (type) {
            case 'Transfer': {
                const decoded = SystemInstruction.decodeTransfer(ix);
                const sol = Number(decoded.lamports) / 1e9;
                return {
                    type: 'SOL Transfer',
                    description: `Transfer ${sol.toFixed(4)} SOL from ${shortKey(decoded.fromPubkey.toBase58())} to ${shortKey(decoded.toPubkey.toBase58())}`,
                };
            }
            case 'CreateAccount': {
                const decoded = SystemInstruction.decodeCreateAccount(ix);
                return {
                    type: 'Create Account',
                    description: `Create new account ${shortKey(decoded.newAccountPubkey.toBase58())} owned by ${shortKey(decoded.programId.toBase58())}`,
                };
            }
            case 'CreateAccountWithSeed': {
                return { type: 'Create Account (with seed)', description: 'Create account derived from seed' };
            }
            case 'Assign': {
                const decoded = SystemInstruction.decodeAssign(ix);
                return {
                    type: 'Assign',
                    description: `Assign account to program ${shortKey(decoded.programId.toBase58())}`,
                };
            }
            case 'Allocate': {
                return { type: 'Allocate', description: 'Allocate space for account data' };
            }
            default:
                return { type, description: `System: ${type}` };
        }
    } catch {
        return { type: 'System Instruction', description: 'Unknown system instruction' };
    }
}

function decodeTokenInstruction(ix: TransactionInstruction): Partial<DecodedInstruction> {
    try {
        const decoded = decodeInstruction(ix);
        const d = decoded as any;

        if ('transferChecked' in d || 'transfer' in d) {
            const info = d.transferChecked ?? d.transfer;
            const amount = info?.amount ? Number(info.amount) : '?';
            return {
                type: 'Token Transfer',
                description: `Transfer ${amount} token units from ${shortKey(info?.source?.toBase58?.() ?? '?')} to ${shortKey(info?.destination?.toBase58?.() ?? '?')}`,
            };
        }
        if ('approve' in d || 'approveChecked' in d) {
            const info = d.approveChecked ?? d.approve;
            const amount = info?.amount ? Number(info.amount) : 'unlimited';
            return {
                type: 'Token Approve',
                description: `⚠️ Approve delegate ${shortKey(info?.delegate?.toBase58?.() ?? '?')} to spend ${amount} tokens`,
            };
        }
        if ('revoke' in d) {
            return { type: 'Token Revoke', description: 'Revoke token delegation (safe)' };
        }
        if ('closeAccount' in d) {
            const info = d.closeAccount;
            return {
                type: 'Close Account',
                description: `🚨 Close token account, drain balance to ${shortKey(info?.destination?.toBase58?.() ?? '?')}`,
            };
        }
        if ('mintTo' in d || 'mintToChecked' in d) {
            const info = d.mintToChecked ?? d.mintTo;
            return { type: 'Mint Tokens', description: `Mint ${info?.amount} tokens to ${shortKey(info?.destination?.toBase58?.() ?? '?')}` };
        }
        if ('burn' in d || 'burnChecked' in d) {
            return { type: 'Burn Tokens', description: 'Burn token supply permanently' };
        }
        if ('setAuthority' in d) {
            const info = d.setAuthority;
            return {
                type: 'Set Authority',
                description: `🚨 Change token authority type ${info?.authorityType} to ${shortKey(info?.newAuthority?.toBase58?.() ?? 'null')}`,
            };
        }
        if ('initializeMint' in d) {
            return { type: 'Initialize Mint', description: 'Create new token mint' };
        }
        if ('initializeAccount' in d) {
            return { type: 'Initialize Token Account', description: 'Create new token account' };
        }
        return { type: 'SPL Token Instruction', description: 'Token program instruction' };
    } catch {
        return { type: 'SPL Token Instruction', description: 'Could not decode token instruction' };
    }
}

function decodeAssociatedTokenInstruction(ix: TransactionInstruction): Partial<DecodedInstruction> {
    const len = ix.data.length;
    if (len === 0) {
        return { type: 'Create ATA', description: 'Create Associated Token Account for wallet' };
    }
    if (ix.data[0] === 1) {
        return { type: 'Create ATA (idempotent)', description: 'Create ATA if it does not exist' };
    }
    return { type: 'Associated Token Instruction', description: 'ATA program call' };
}

function decodeComputeBudget(ix: TransactionInstruction): Partial<DecodedInstruction> {
    const view = new DataView(ix.data.buffer, ix.data.byteOffset);
    const discriminator = view.getUint8(0);
    if (discriminator === 2) {
        const units = view.getUint32(1, true);
        return { type: 'Set Compute Limit', description: `Request ${units.toLocaleString()} compute units` };
    }
    if (discriminator === 3) {
        const microLamports = Number(view.getBigUint64(1, true));
        return { type: 'Set Priority Fee', description: `Priority fee: ${microLamports} microLamports/CU` };
    }
    return { type: 'Compute Budget', description: 'Modify compute budget' };
}

export function decodeInstructions(instructions: TransactionInstruction[]): DecodedInstruction[] {
    return instructions.map((ix, index) => {
        const programId = ix.programId.toBase58();
        const programInfo = getProgramInfo(programId);
        const accounts = ix.keys.map((k) => k.pubkey.toBase58());
        const data = Buffer.from(ix.data).toString('base64');

        let partial: Partial<DecodedInstruction> = {};

        if (programId === SYSTEM_PROGRAM_ID) {
            partial = decodeSystemInstruction(ix);
        } else if (programId === TOKEN_PROGRAM_STR || programId === TOKEN_2022_STR) {
            partial = decodeTokenInstruction(ix);
        } else if (programId === ASSOCIATED_TOKEN_STR) {
            partial = decodeAssociatedTokenInstruction(ix);
        } else if (programId === COMPUTE_BUDGET_ID) {
            partial = decodeComputeBudget(ix);
        } else {
            partial = {
                type: 'Unknown Instruction',
                description: `Interact with unknown program ${shortKey(programId)}`,
            };
        }

        return {
            index,
            programId,
            programName: programInfo.name,
            type: partial.type ?? 'Unknown',
            description: partial.description ?? 'No description available',
            accounts,
            data,
            isKnown: programInfo.verified,
        };
    });
}

export function buildCPITree(logs: string[]): import('./types').CPINode[] {
    const roots: import('./types').CPINode[] = [];
    const stack: import('./types').CPINode[] = [];
    const { getProgramInfo } = require('./programRegistry');

    for (const log of logs) {
        const invokeMatch = log.match(/Program (\S+) invoke \[(\d+)\]/);
        if (invokeMatch) {
            const programId = invokeMatch[1];
            const depth = parseInt(invokeMatch[2]) - 1;
            const info = getProgramInfo(programId);
            const node: import('./types').CPINode = {
                programId,
                programName: info.name,
                depth,
                children: [],
            };
            if (depth === 0) {
                roots.push(node);
                stack.length = 0;
                stack.push(node);
            } else {
                const parent = stack[depth - 1];
                if (parent) parent.children.push(node);
                stack[depth] = node;
            }
        }
    }

    return roots;
}
