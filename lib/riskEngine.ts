import { DecodedInstruction, RiskAnalysis, RiskFactor, ScamHeuristic, Warning } from './types';
import { isProgramKnown } from './programRegistry';

export function isStaleError(error?: string | null): boolean {
    if (!error) return false;
    return (
        error.includes('IllegalOwner') ||
        error.includes('"IllegalOwner"') ||
        error.includes('AccountNotFound') ||
        error.includes('"AccountNotFound"') ||
        error.includes('InvalidAccountData') ||
        error.includes('"InvalidAccountData"')
    );
}

export function analyzeRisk(
    instructions: DecodedInstruction[],
    logs: string[],
    computeUnits: number
): RiskAnalysis {
    const factors: RiskFactor[] = [];
    let score = 0;

    const unknownPrograms = instructions.filter((ix) => !ix.isKnown);
    if (unknownPrograms.length > 0) {
        const weight = Math.min(unknownPrograms.length * 15, 30);
        score += weight;
        factors.push({
            name: 'Unknown Program(s)',
            description: `${unknownPrograms.length} instruction(s) use unverified programs`,
            weight,
        });
    }

    const approvals = instructions.filter((ix) => ix.type === 'Token Approve');
    if (approvals.length > 0) {
        const weight = approvals.length >= 2 ? 25 : 15;
        score += weight;
        factors.push({
            name: 'Token Approval Detected',
            description: `${approvals.length} token spending approval(s) in this transaction`,
            weight,
        });
    }

    const closures = instructions.filter((ix) => ix.type === 'Close Account');
    if (closures.length > 0) {
        score += 20;
        factors.push({
            name: 'Account Closure',
            description: `${closures.length} account(s) will be closed and SOL drained`,
            weight: 20,
        });
    }

    const setAuth = instructions.filter((ix) => ix.type === 'Set Authority');
    if (setAuth.length > 0) {
        score += 25;
        factors.push({
            name: 'Authority Change',
            description: 'Token or mint authority is being changed',
            weight: 25,
        });
    }

    const nonBudgetInstructions = instructions.filter(
        (ix) => ix.type !== 'Set Compute Limit' && ix.type !== 'Set Priority Fee'
    );
    if (nonBudgetInstructions.length > 5) {
        score += 10;
        factors.push({
            name: 'Multiple Instructions',
            description: `${nonBudgetInstructions.length} instructions chained — verify each one`,
            weight: 10,
        });
    }

    if (computeUnits > 400_000) {
        score += 10;
        factors.push({
            name: 'High Compute Usage',
            description: `${computeUnits.toLocaleString()} CUs — complex execution chain`,
            weight: 10,
        });
    }

    const solTransfers = instructions.filter((ix) => ix.type === 'SOL Transfer');
    for (const tx of solTransfers) {
        const match = tx.description.match(/([\d.]+) SOL/);
        if (match && parseFloat(match[1]) > 5) {
            score += 15;
            factors.push({
                name: 'Large SOL Transfer',
                description: `Transferring ${match[1]} SOL — verify recipient`,
                weight: 15,
            });
        }
    }

    const unknownInLogs = logs.some((l) => {
        const m = l.match(/Program (\S+) invoke/);
        return m ? !isProgramKnown(m[1]) : false;
    });
    if (unknownInLogs && unknownPrograms.length === 0) {
        score += 10;
        factors.push({
            name: 'Unknown CPI Program',
            description: 'An unverified program is invoked during execution',
            weight: 10,
        });
    }

    score = Math.min(score, 100);

    const level: RiskAnalysis['level'] =
        score <= 20 ? 'safe' : score <= 50 ? 'review' : 'danger';

    const heuristics: ScamHeuristic[] = [
        {
            id: 'unlimited_approval',
            name: 'Unlimited Token Approval',
            description: 'Approving a delegate to spend all of your tokens is a phishing pattern',
            severity: 'high',
            triggered: instructions.some(
                (ix) => ix.type === 'Token Approve' && ix.description.toLowerCase().includes('unlimited')
            ),
        },
        {
            id: 'nft_authority_change',
            name: 'NFT Authority Change',
            description: 'Changing NFT mint or update authority can transfer ownership of your NFT',
            severity: 'high',
            triggered: setAuth.length > 0,
        },
        {
            id: 'close_account_drain',
            name: 'Account Closure Drain',
            description: 'Closing token accounts drains their lamport balance to a destination',
            severity: 'high',
            triggered: closures.length > 0,
        },
        {
            id: 'unknown_delegate',
            name: 'Delegate Set to Unknown Address',
            description: 'Delegating to an unknown address may allow theft of your tokens',
            severity: 'high',
            triggered: approvals.length > 0,
        },
        {
            id: 'instruction_chaining',
            name: 'Multiple Instructions Chaining',
            description: 'Complex multi-instruction transactions can hide malicious actions',
            severity: 'medium',
            triggered: nonBudgetInstructions.length > 4,
        },
        {
            id: 'unknown_cpi',
            name: 'Unknown CPI Target',
            description: 'An unknown program is invoked via Cross Program Invocation',
            severity: 'medium',
            triggered: unknownInLogs || unknownPrograms.length > 0,
        },
    ];

    return { score, level, factors, heuristics };
}

export function generateWarnings(
    instructions: DecodedInstruction[],
    riskAnalysis: RiskAnalysis,
    simulationFailed?: boolean,
    error?: string | null
): Warning[] {
    const warnings: Warning[] = [];
    const isStale = simulationFailed && isStaleError(error);

    // Stale = already landed on-chain, no warnings are meaningful
    if (isStale) return warnings;

    if (instructions.some((ix) => !ix.isKnown)) {
        warnings.push({
            type: 'warning',
            title: 'Unknown Program Interaction',
            description: 'One or more instructions involve programs not in the verified registry.',
        });
    }

    if (instructions.some((ix) => ix.type === 'Token Approve')) {
        warnings.push({
            type: 'warning',
            title: 'Token Approval Detected',
            description: 'This transaction grants spending permission to a delegate address.',
        });
    }

    if (instructions.some((ix) => ix.type === 'Close Account')) {
        warnings.push({
            type: 'danger',
            title: 'Account Closure Detected',
            description: 'An account will be closed and its balance transferred out.',
        });
    }

    if (instructions.some((ix) => ix.type === 'Set Authority')) {
        warnings.push({
            type: 'danger',
            title: 'Authority Change Detected',
            description: 'Token or NFT authority is being modified in this transaction.',
        });
    }

    if (riskAnalysis.score > 50) {
        warnings.push({
            type: 'danger',
            title: 'High Risk Transaction',
            description: `Risk score ${riskAnalysis.score}/100 — review every instruction carefully before signing.`,
        });
    } else if (riskAnalysis.score > 20) {
        warnings.push({
            type: 'warning',
            title: 'Review Recommended',
            description: `Risk score ${riskAnalysis.score}/100 — some aspects of this transaction need attention.`,
        });
    }

    return warnings;
}

export function generateHumanSummary(
    instructions: DecodedInstruction[],
    logs?: string[],
    simulationFailed?: boolean,
    error?: string | null
): string {
    if (simulationFailed) {
        if (isStaleError(error)) {
            return 'Simulation failed because one or more accounts have changed state since this transaction landed on-chain. This is expected for historical transactions.';
        }

        const logText = (logs ?? []).join(' ').toLowerCase();
        const isDex =
            logText.includes('swap') ||
            logText.includes('raydium') ||
            logText.includes('whirlpool') ||
            logText.includes('orca') ||
            logText.includes('jupiter') ||
            logText.includes('amm') ||
            instructions.some((ix) =>
                ix.description.toLowerCase().includes('swap') ||
                ix.programName.toLowerCase().includes('raydium') ||
                ix.programName.toLowerCase().includes('whirlpool') ||
                ix.programName.toLowerCase().includes('orca') ||
                ix.programName.toLowerCase().includes('jupiter')
            );

        if (isDex) {
            return 'This appears to be a DEX swap. Simulation failed likely due to stale pool state — the transaction may have succeeded on-chain at the time it was submitted.';
        }

        return 'Simulation failed against current chain state. If this is a historical transaction, on-chain conditions may have changed since it landed.';
    }

    const parts: string[] = [];
    const types = instructions.map((ix) => ix.type);

    if (types.includes('SOL Transfer')) parts.push('transfer SOL');
    if (types.includes('Token Transfer')) parts.push('transfer tokens');
    if (types.includes('Token Approve')) parts.push('grant token spending permission to a delegate');
    if (types.includes('Close Account')) parts.push('close token accounts and drain their balance');
    if (types.includes('Create Account') || types.includes('Create ATA')) parts.push('create new accounts');
    if (types.includes('Set Authority')) parts.push('change authority over a token or NFT');
    if (types.includes('Mint Tokens')) parts.push('mint new tokens');
    if (types.includes('Burn Tokens')) parts.push('burn tokens permanently');
    if (types.some((t) => t === 'Unknown Instruction')) {
        parts.push('interact with one or more unverified programs');
    }

    if (parts.length === 0 && logs && logs.length > 0) {
        const logText = logs.join(' ').toLowerCase();
        if (logText.includes('swap')) parts.push('perform a token swap');
        if (logText.includes('transfer')) parts.push('transfer tokens or assets');
        if (logText.includes('mint')) parts.push('mint tokens');
        if (logText.includes('burn')) parts.push('burn tokens');
        if (logText.includes('stake')) parts.push('interact with staking');
        if (logText.includes('nft') || logText.includes('metadata')) parts.push('interact with an NFT');
        if (logText.includes('liquidity') || logText.includes('pool')) parts.push('interact with a liquidity pool');
        if (logText.includes('borrow') || logText.includes('repay')) parts.push('interact with a lending protocol');
    }

    if (parts.length === 0) {
        return 'This transaction interacts with Solana programs. Check the Instructions tab for full details.';
    }

    const joined =
        parts.length === 1
            ? parts[0]
            : parts.slice(0, -1).join(', ') + ', and ' + parts[parts.length - 1];

    return `This transaction will ${joined}.`;
}
