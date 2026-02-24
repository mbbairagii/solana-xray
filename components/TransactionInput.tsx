'use client';

import { useState } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

interface Props {
    onSimulate: (input: string, signature?: string) => void;
    loading: boolean;
}

const DEMOS: {
    label: string;
    title: string;
    steps: string[];
    link: string;
    linkLabel: string;
}[] = [
        {
            label: 'SOL Transfer',
            title: 'How to test a SOL Transfer',
            steps: [
                'Open Solscan using the button below',
                'Click any transaction labeled "SOL Transfer" from the feed',
                'Copy the long signature string from the top of the page',
                'Paste it in the input above and hit Fetch & Simulate',
            ],
            link: 'https://solscan.io/txs?filter=sol-transfer',
            linkLabel: 'Open Solscan ↗',
        },
        {
            label: 'Pump.fun Swap',
            title: 'How to test a Pump.fun Swap',
            steps: [
                'Open Pump.fun using the button below',
                'Click any token from the feed',
                'Scroll to recent trades and click any trade row',
                'It opens Solscan — copy the signature from the top',
                'Paste it in the input above and hit Fetch & Simulate',
            ],
            link: 'https://pump.fun',
            linkLabel: 'Open Pump.fun ↗',
        },
        {
            label: 'Token Approve',
            title: 'How to test a Token Approve',
            steps: [
                'Open Solscan SPL token transactions using the button below',
                'Look for a transaction with type "Approve"',
                'Click it and copy the signature from the top of the page',
                'Paste it in the input above and hit Fetch & Simulate',
            ],
            link: 'https://solscan.io/txs?filter=spl-token',
            linkLabel: 'Open Solscan SPL ↗',
        },
    ];

const C = {
    bg: '#07090B',
    card: '#0C0F12',
    border: 'rgba(255,255,255,0.06)',
    borderFocus: 'rgba(126,184,201,0.35)',
    textPrimary: '#F1F5F9',
    textSecondary: '#8896A5',
    textMuted: '#3D4F5C',
    hi: '#7EB8C9',
    hiDim: 'rgba(126,184,201,0.08)',
    hiBorder: 'rgba(126,184,201,0.18)',
    amber: 'rgba(245,158,11,0.12)',
    amberBorder: 'rgba(245,158,11,0.2)',
    amberText: '#F59E0B',
};

export function TransactionInput({ onSimulate, loading }: Props) {
    const [mode, setMode] = useState<'signature' | 'base64'>('signature');
    const [input, setInput] = useState('');
    const [sig, setSig] = useState('');
    const [fetching, setFetching] = useState(false);
    const [fetchError, setFetchError] = useState('');
    const [activeDemo, setActiveDemo] = useState<number | null>(null);

    const RPC = process.env.NEXT_PUBLIC_RPC_URL!;
    const isActive = fetching || loading;
    const canSimulate = sig.trim() && !isActive;

    const fetchFromSignature = async (signature: string) => {
        if (!signature.trim()) return;
        setFetching(true);
        setFetchError('');
        setActiveDemo(null);
        try {
            const res = await fetch(RPC, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'getTransaction',
                    params: [
                        signature.trim(),
                        { encoding: 'base64', maxSupportedTransactionVersion: 0 },
                    ],
                }),
            });
            const data = await res.json();
            const base64 = data?.result?.transaction?.[0];
            if (!base64) {
                setFetchError('Transaction not found. The signature may be invalid or too old.');
                return;
            }
            onSimulate(base64, signature.trim());
        } catch (e: any) {
            setFetchError(`Fetch failed: ${e.message}`);
        } finally {
            setFetching(false);
        }
    };

    const handleDemoClick = (index: number) => {
        setActiveDemo(activeDemo === index ? null : index);
        setFetchError('');
    };

    return (
        <div style={{
            background: 'rgba(12,15,18,0.85)',
            backdropFilter: 'blur(12px)',
            border: `1px solid ${C.border}`,
            borderRadius: '20px',
            padding: '28px',
            fontFamily: 'Inter, sans-serif',
        }}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '17px', fontWeight: 700, color: C.textPrimary, margin: 0, letterSpacing: '-0.3px' }}>
                    Transaction Input
                </h2>
                <WalletMultiButton style={{
                    background: C.hi,
                    color: '#07090B',
                    fontWeight: 700,
                    fontSize: '12px',
                    borderRadius: '10px',
                    padding: '8px 16px',
                    border: 'none',
                    cursor: 'pointer',
                }} />
            </div>

            <div style={{
                display: 'flex',
                borderRadius: '10px',
                overflow: 'hidden',
                border: `1px solid ${C.border}`,
                width: 'fit-content',
                marginBottom: '20px',
            }}>
                {(['signature', 'base64'] as const).map((m) => (
                    <button
                        key={m}
                        onClick={() => setMode(m)}
                        style={{
                            padding: '8px 18px',
                            fontSize: '12px',
                            fontWeight: 600,
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                            background: mode === m ? C.hi : 'transparent',
                            color: mode === m ? '#07090B' : C.textMuted,
                            letterSpacing: '-0.1px',
                        }}
                    >
                        {m === 'signature' ? 'Tx Signature' : 'Raw Base64'}
                    </button>
                ))}
            </div>

            {mode === 'signature' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <input
                        value={sig}
                        onChange={(e) => { setSig(e.target.value); setFetchError(''); setActiveDemo(null); }}
                        placeholder="Paste transaction signature…"
                        onKeyDown={(e) => { if (e.key === 'Enter') fetchFromSignature(sig); }}
                        style={{
                            width: '100%',
                            background: C.bg,
                            border: `1px solid ${C.border}`,
                            borderRadius: '12px',
                            padding: '14px 16px',
                            fontSize: '13px',
                            fontFamily: 'JetBrains Mono, monospace',
                            color: C.textSecondary,
                            outline: 'none',
                            boxSizing: 'border-box',
                            transition: 'border-color 0.15s',
                        }}
                        onFocus={(e) => { e.target.style.borderColor = C.borderFocus; }}
                        onBlur={(e) => { e.target.style.borderColor = C.border; }}
                    />

                    {fetchError && (
                        <p style={{ color: '#F87171', fontSize: '12px', margin: 0 }}>⚠ {fetchError}</p>
                    )}

                    <button
                        onClick={() => fetchFromSignature(sig)}
                        disabled={!canSimulate}
                        style={{
                            width: '100%',
                            background: canSimulate ? C.hi : 'rgba(255,255,255,0.04)',
                            color: canSimulate ? '#07090B' : C.textMuted,
                            fontWeight: 700,
                            fontSize: '14px',
                            padding: '14px',
                            borderRadius: '12px',
                            border: 'none',
                            cursor: canSimulate ? 'pointer' : 'not-allowed',
                            transition: 'all 0.15s',
                            letterSpacing: '-0.2px',
                        }}
                    >
                        {isActive ? (
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <svg
                                    style={{ animation: 'spin 1s linear infinite', width: '15px', height: '15px' }}
                                    viewBox="0 0 24 24"
                                    fill="none"
                                >
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2" />
                                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                </svg>
                                Fetching & Simulating…
                            </span>
                        ) : 'Fetch & Simulate'}
                    </button>

                    <div>
                        <p style={{
                            fontSize: '10px',
                            color: C.textMuted,
                            marginBottom: '8px',
                            textTransform: 'uppercase',
                            letterSpacing: '1.5px',
                        }}>
                            Or try a demo
                        </p>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {DEMOS.map((d, i) => (
                                <button
                                    key={d.label}
                                    onClick={() => handleDemoClick(i)}
                                    disabled={isActive}
                                    style={{
                                        fontSize: '12px',
                                        fontWeight: 500,
                                        padding: '7px 14px',
                                        borderRadius: '8px',
                                        border: `1px solid ${activeDemo === i ? C.amberBorder : C.border}`,
                                        background: activeDemo === i ? C.amber : 'transparent',
                                        color: activeDemo === i ? C.amberText : C.textMuted,
                                        cursor: 'pointer',
                                        transition: 'all 0.15s',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (activeDemo !== i) {
                                            e.currentTarget.style.borderColor = C.hiBorder;
                                            e.currentTarget.style.color = C.hi;
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (activeDemo !== i) {
                                            e.currentTarget.style.borderColor = C.border;
                                            e.currentTarget.style.color = C.textMuted;
                                        }
                                    }}
                                >
                                    {d.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {activeDemo !== null && (
                        <div style={{
                            background: C.amber,
                            border: `1px solid ${C.amberBorder}`,
                            borderRadius: '14px',
                            padding: '18px 20px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            animation: 'fadeIn 0.15s ease',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <p style={{ fontSize: '13px', fontWeight: 700, color: C.amberText, margin: 0 }}>
                                    💡 {DEMOS[activeDemo].title}
                                </p>
                                <button
                                    onClick={() => setActiveDemo(null)}
                                    style={{
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        color: C.textMuted, fontSize: '16px', lineHeight: 1, padding: '0 2px',
                                    }}
                                >
                                    ×
                                </button>
                            </div>

                            <ol style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {DEMOS[activeDemo].steps.map((step, i) => (
                                    <li key={i} style={{ fontSize: '12px', color: '#94A3B8', lineHeight: 1.6 }}>
                                        {step}
                                    </li>
                                ))}
                            </ol>

                            <a
                                href={DEMOS[activeDemo].link}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    color: '#07090B',
                                    background: C.amberText,
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    textDecoration: 'none',
                                    width: 'fit-content',
                                    transition: 'opacity 0.15s',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                            >
                                {DEMOS[activeDemo].linkLabel}
                            </a>
                        </div>
                    )}
                </div>
            )}

            {mode === 'base64' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Paste base64 encoded transaction here…"
                        style={{
                            width: '100%',
                            height: '120px',
                            background: C.bg,
                            border: `1px solid ${C.border}`,
                            borderRadius: '12px',
                            padding: '14px 16px',
                            fontSize: '12px',
                            fontFamily: 'JetBrains Mono, monospace',
                            color: C.textSecondary,
                            resize: 'none',
                            outline: 'none',
                            transition: 'border-color 0.15s',
                            boxSizing: 'border-box',
                            lineHeight: 1.7,
                        }}
                        onFocus={(e) => { e.target.style.borderColor = C.borderFocus; }}
                        onBlur={(e) => { e.target.style.borderColor = C.border; }}
                    />
                    <button
                        onClick={() => onSimulate(input)}
                        disabled={!input.trim() || loading}
                        style={{
                            width: '100%',
                            background: input.trim() && !loading ? C.hi : 'rgba(255,255,255,0.04)',
                            color: input.trim() && !loading ? '#07090B' : C.textMuted,
                            fontWeight: 700,
                            fontSize: '14px',
                            padding: '14px',
                            borderRadius: '12px',
                            border: 'none',
                            cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                            transition: 'all 0.15s',
                        }}
                    >
                        {loading ? 'Simulating…' : 'Simulate Transaction'}
                    </button>
                </div>
            )}

            <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
        </div>
    );
}
