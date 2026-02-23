import { PublicKey } from '@solana/web3.js';

export interface SimulationResult {
    success: boolean;
    logs: string[];
    computeUnitsUsed: number;
    error: string | null;
    accounts: AccountChange[];
    instructions: DecodedInstruction[];
    cpiTree: CPINode[];
    riskAnalysis: RiskAnalysis;
    humanSummary: string;
    warnings: Warning[];
}

export interface AccountChange {
    pubkey: string;
    label?: string;
    before: {
        lamports: number;
        owner: string;
        tokenBalance?: TokenBalance;
    };
    after: {
        lamports: number;
        owner: string;
        tokenBalance?: TokenBalance;
    };
    ownerChanged: boolean;
    isClosed: boolean;
}

export interface TokenBalance {
    mint: string;
    symbol?: string;
    amount: string;
    uiAmount: number;
    decimals: number;
}

export interface DecodedInstruction {
    index: number;
    programId: string;
    programName: string;
    type: string;
    description: string;
    accounts: string[];
    data: string;
    isKnown: boolean;
}

export interface CPINode {
    programId: string;
    programName: string;
    depth: number;
    children: CPINode[];
    instructionType?: string;
}

export interface RiskAnalysis {
    score: number;
    level: 'safe' | 'review' | 'danger';
    factors: RiskFactor[];
    heuristics: ScamHeuristic[];
}

export interface RiskFactor {
    name: string;
    description: string;
    weight: number;
}

export interface ScamHeuristic {
    id: string;
    name: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
    triggered: boolean;
}

export interface Warning {
    type: 'info' | 'warning' | 'danger';
    title: string;
    description: string;
}

export interface ProgramInfo {
    programId: string;
    name: string;
    verified: boolean;
    tag?: string;
    description?: string;
}
