'use client';

import { useState } from 'react';
import { SimulationResult as TSimulationResult } from '@/lib/types';
import { RiskScore } from './RiskScore';
import { InstructionDecoder } from './InstructionDecoder';
import { CPITree } from './CPITree';
import { AccountDiff } from './AccountDiff';
import { WarningBanners } from './WarningBanners';
import { ProgramTrust } from './ProgramTrust';

interface Props { result: TSimulationResult; }
type Tab = 'overview' | 'instructions' | 'accounts' | 'cpi' | 'programs' | 'logs';

const TABS: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'instructions', label: 'Instructions' },
    { id: 'accounts', label: 'Account Diff' },
    { id: 'cpi', label: 'CPI Tree' },
    { id: 'programs', label: 'Programs' },
    { id: 'logs', label: 'Logs' },
];

const C = {
    bg: '#080A0C',
    card: '#0E1014',
    cardInner: '#080A0C',
    border: 'rgba(255,255,255,0.06)',
    textPrimary: '#F1F5F9',
    textSecondary: '#94A3B8',
    textMuted: '#475569',
    textFaint: '#1E293B',
};

function isStaleResult(result: TSimulationResult): boolean {
    if (result.success) return false;
    const e = result.error ?? '';
    const summary = result.humanSummary.toLowerCase();

    // Only trust the error code — not summary text fallbacks
    const isStaleError =
        e.includes('IllegalOwner') ||
        e.includes('"IllegalOwner"') ||
        e.includes('AccountNotFound') ||
        e.includes('"AccountNotFound"') ||
        e.includes('InvalidAccountData') ||
        e.includes('"InvalidAccountData"');

    // Only match the two specific stale summaries we write intentionally
    const isStaleSummary =
        summary.includes('stale pool state') ||
        summary.includes('changed state since this transaction landed');

    return isStaleError || isStaleSummary;
}


export function SimulationResult({ result }: Props) {
    const [tab, setTab] = useState<Tab>('overview');
    const [mode, setMode] = useState<'dev' | 'simple'>('simple');

    const isStale = isStaleResult(result);

    const statusColor = result.success ? '#10B981' : isStale ? '#F59E0B' : '#EF4444';
    const statusGlow = result.success
        ? 'rgba(16,185,129,0.4)'
        : isStale
            ? 'rgba(245,158,11,0.4)'
            : 'rgba(239,68,68,0.4)';
    const statusLabel = result.success
        ? 'Simulation Successful'
        : isStale
            ? 'Stale State — Likely Succeeded On-chain'
            : 'Simulation Failed';

    return (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '20px', overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '16px 24px', borderBottom: `1px solid ${C.border}`, gap: '10px' }}>
                <span style={{
                    width: '9px', height: '9px', borderRadius: '50%', display: 'inline-block',
                    background: statusColor,
                    boxShadow: `0 0 8px ${statusGlow}`,
                }} />
                <span style={{ fontSize: '14px', fontWeight: 600, color: C.textPrimary }}>
                    {statusLabel}
                </span>
                <span style={{
                    fontSize: '11px', color: C.textMuted,
                    background: 'rgba(255,255,255,0.04)',
                    padding: '3px 10px', borderRadius: '99px',
                    border: `1px solid ${C.border}`,
                }}>
                    {isStale && result.computeUnitsUsed === 0
                        ? 'CUs unavailable'
                        : `${result.computeUnitsUsed.toLocaleString()} CUs`}
                </span>
            </div>

            {/* Summary */}
            <div style={{ padding: '14px 24px', background: 'rgba(255,255,255,0.02)', borderBottom: `1px solid ${C.border}` }}>
                <p style={{ fontSize: '13px', color: C.textSecondary, margin: 0, lineHeight: 1.7 }}>
                    <span style={{ color: C.textPrimary, fontWeight: 600 }}>Summary: </span>
                    {result.humanSummary}
                </p>
                {result.error && !isStale && (
                    <p style={{ color: '#F87171', fontSize: '12px', fontFamily: 'JetBrains Mono, monospace', margin: '8px 0 0' }}>
                        Error: {result.error}
                    </p>
                )}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, overflowX: 'auto' }}>
                {TABS.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        style={{
                            padding: '13px 20px', fontSize: '12px', fontWeight: 600,
                            border: 'none', background: 'none', cursor: 'pointer',
                            whiteSpace: 'nowrap', transition: 'all 0.15s',
                            color: tab === t.id ? C.textPrimary : C.textMuted,
                            borderBottom: tab === t.id ? `2px solid ${C.textPrimary}` : '2px solid transparent',
                        }}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div style={{ padding: '28px 24px' }}>

                {tab === 'overview' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                        {isStale ? (
                            <div style={{
                                background: C.cardInner, borderRadius: '14px', padding: '18px 20px',
                                border: `1px solid rgba(245,158,11,0.15)`,
                                display: 'flex', gap: '12px', alignItems: 'flex-start',
                            }}>
                                <span style={{ fontSize: '16px', marginTop: '1px' }}>⚠️</span>
                                <p style={{ fontSize: '13px', color: C.textMuted, margin: 0, lineHeight: 1.7 }}>
                                    Risk analysis is not applicable for historical transactions — the simulation ran against
                                    current chain state, not the state at the time this transaction landed on-chain.
                                </p>
                            </div>
                        ) : (
                            <>
                                <WarningBanners warnings={result.warnings} />
                                <RiskScore risk={result.riskAnalysis} />
                            </>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                            {[
                                { label: 'Instructions', value: result.instructions.length },
                                { label: 'Programs', value: [...new Set(result.instructions.map((i) => i.programId))].length },
                                { label: 'Compute Units', value: isStale && result.computeUnitsUsed === 0 ? 'N/A' : result.computeUnitsUsed.toLocaleString() },
                            ].map((s) => (
                                <div key={s.label} style={{
                                    background: C.cardInner, borderRadius: '14px', padding: '20px',
                                    border: `1px solid ${C.border}`, textAlign: 'center',
                                }}>
                                    <p style={{ fontSize: '26px', fontWeight: 800, color: C.textPrimary, margin: '0 0 4px', letterSpacing: '-1px' }}>
                                        {s.value}
                                    </p>
                                    <p style={{ fontSize: '12px', color: C.textMuted, margin: 0 }}>{s.label}</p>
                                </div>
                            ))}
                        </div>

                    </div>
                )}

                {tab === 'instructions' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <p style={{ fontSize: '12px', color: C.textMuted, margin: 0 }}>
                                {result.instructions.length} instruction{result.instructions.length !== 1 ? 's' : ''} decoded
                            </p>
                            <div style={{ display: 'flex', borderRadius: '8px', overflow: 'hidden', border: `1px solid ${C.border}` }}>
                                <button
                                    onClick={() => setMode('simple')}
                                    style={{
                                        padding: '6px 14px', fontSize: '11px', fontWeight: 600,
                                        border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                                        background: mode === 'simple' ? C.textPrimary : 'transparent',
                                        color: mode === 'simple' ? '#080A0C' : C.textMuted,
                                    }}
                                >
                                    Plain English
                                </button>
                                <button
                                    onClick={() => setMode('dev')}
                                    style={{
                                        padding: '6px 14px', fontSize: '11px', fontWeight: 600,
                                        border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                                        background: mode === 'dev' ? C.textPrimary : 'transparent',
                                        color: mode === 'dev' ? '#080A0C' : C.textMuted,
                                    }}
                                >
                                    Dev View
                                </button>
                            </div>
                        </div>
                        <InstructionDecoder instructions={result.instructions} mode={mode} />
                    </div>
                )}

                {tab === 'accounts' && <AccountDiff accounts={result.accounts} />}
                {tab === 'cpi' && <CPITree nodes={result.cpiTree} />}
                {tab === 'programs' && <ProgramTrust instructions={result.instructions} />}

                {tab === 'logs' && (
                    <div style={{
                        background: C.cardInner, borderRadius: '14px', padding: '20px',
                        maxHeight: '360px', overflowY: 'auto', border: `1px solid ${C.border}`,
                    }}>
                        {result.logs.length === 0
                            ? <p style={{ color: C.textFaint, fontSize: '13px', margin: 0 }}>No logs returned.</p>
                            : result.logs.map((log, i) => (
                                <p key={i} style={{
                                    fontFamily: 'JetBrains Mono, monospace', fontSize: '12px',
                                    color: C.textMuted, lineHeight: 1.8, margin: 0,
                                    borderBottom: i < result.logs.length - 1 ? `1px solid rgba(255,255,255,0.03)` : 'none',
                                    padding: '3px 0',
                                }}>
                                    {log}
                                </p>
                            ))
                        }
                    </div>
                )}

            </div>
        </div>
    );
}
