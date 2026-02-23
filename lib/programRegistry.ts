import { ProgramInfo } from './types';

export const KNOWN_PROGRAMS: Record<string, ProgramInfo> = {
    '11111111111111111111111111111111': {
        programId: '11111111111111111111111111111111',
        name: 'System Program',
        verified: true,
        tag: 'Native',
        description: 'Core Solana system program for SOL transfers and account creation',
    },
    'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA': {
        programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
        name: 'SPL Token Program',
        verified: true,
        tag: 'SPL',
        description: 'Standard token program for fungible and non-fungible tokens',
    },
    'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb': {
        programId: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
        name: 'Token-2022 Program',
        verified: true,
        tag: 'SPL',
        description: 'Next-gen token program with extensions',
    },
    'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJe1kfs': {
        programId: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJe1kfs',
        name: 'Associated Token Program',
        verified: true,
        tag: 'SPL',
        description: 'Creates associated token accounts',
    },
    'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s': {
        programId: 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
        name: 'Metaplex Token Metadata',
        verified: true,
        tag: 'Metaplex',
        description: 'NFT metadata standard by Metaplex',
    },
    'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4': {
        programId: 'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4',
        name: 'Jupiter v6',
        verified: true,
        tag: 'Jupiter',
        description: 'Aggregated DEX swap router',
    },
    '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8': {
        programId: '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8',
        name: 'Raydium AMM',
        verified: true,
        tag: 'Raydium',
        description: 'Raydium automated market maker',
    },
    'So11111111111111111111111111111111111111112': {
        programId: 'So11111111111111111111111111111111111111112',
        name: 'Wrapped SOL Mint',
        verified: true,
        tag: 'Native',
        description: 'Wrapped SOL token mint',
    },
    'ComputeBudget111111111111111111111111111111': {
        programId: 'ComputeBudget111111111111111111111111111111',
        name: 'Compute Budget Program',
        verified: true,
        tag: 'Native',
        description: 'Sets compute unit limits and priority fees',
    },
    'Vote111111111111111111111111111111111111111h': {
        programId: 'Vote111111111111111111111111111111111111111h',
        name: 'Vote Program',
        verified: true,
        tag: 'Native',
    },
};

export function getProgramInfo(programId: string): ProgramInfo {
    return (
        KNOWN_PROGRAMS[programId] ?? {
            programId,
            name: 'Unknown Program',
            verified: false,
            tag: undefined,
            description: 'This program is not in the known registry.',
        }
    );
}

export function isProgramKnown(programId: string): boolean {
    return programId in KNOWN_PROGRAMS;
}
