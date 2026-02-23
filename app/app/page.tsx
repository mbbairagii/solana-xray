'use client';

import { useRouter } from 'next/navigation';
import { useSimulator } from '@/hooks/useSimulator';
import { TransactionInput } from '@/components/TransactionInput';
import { SimulationResult } from '@/components/SimulationResult';

const C = {
    bg: '#07090B',
    card: '#0C0F12',
    border: 'rgba(255,255,255,0.06)',
    textPrimary: '#F1F5F9',
    textMuted: '#3D4F5C',
    textSecondary: '#8896A5',
    hi: '#7EB8C9',
    hiBorder: 'rgba(126,184,201,0.22)',
};

export default function AppPage() {
    const { result, loading, error, simulate } = useSimulator();
    const router = useRouter();

    return (
        <main style={{ minHeight: '100vh', background: C.bg, color: C.textSecondary, fontFamily: 'Inter, sans-serif', position: 'relative', overflow: 'hidden' }}>

            <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: 'url(/x1.jpeg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center top',
                    opacity: 0.14,
                    filter: 'grayscale(85%) contrast(1.05)',
                }} />
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(180deg, rgba(7,9,11,0.55) 0%, rgba(7,9,11,0.4) 30%, rgba(7,9,11,0.75) 80%, rgba(7,9,11,0.98) 100%)',
                }} />
                <div style={{
                    position: 'absolute', inset: '-50%',
                    width: '200%', height: '200%',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'repeat',
                    backgroundSize: '180px 180px',
                    opacity: 0.025,
                    mixBlendMode: 'overlay',
                }} />
            </div>

            <div style={{
                borderBottom: `1px solid ${C.border}`,
                background: 'rgba(7,9,11,0.75)',
                backdropFilter: 'blur(16px)',
                position: 'sticky', top: 0,
            }}>
                <div style={{ maxWidth: '900px', margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                        onClick={() => router.push('/')}
                        style={{
                            fontSize: '12px', color: C.textMuted, background: 'none',
                            border: `1px solid ${C.border}`, borderRadius: '8px',
                            padding: '6px 12px', cursor: 'pointer', transition: 'all 0.15s',
                        }}
                        onMouseEnter={(e) => {
                            (e.target as HTMLButtonElement).style.color = C.textPrimary;
                            (e.target as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.15)';
                        }}
                        onMouseLeave={(e) => {
                            (e.target as HTMLButtonElement).style.color = C.textMuted;
                            (e.target as HTMLButtonElement).style.borderColor = C.border;
                        }}
                    >
                        ← Back
                    </button>
                    <span style={{ fontSize: '18px' }}>🧬</span>
                    <div>
                        <h1 style={{ fontSize: '14px', fontWeight: 700, color: C.textPrimary, margin: 0, letterSpacing: '-0.3px' }}>
                            Solana TX X-Ray
                        </h1>
                        <p style={{ fontSize: '11px', color: C.textMuted, margin: 0 }}>Transaction Simulator + Risk Explainer</p>
                    </div>
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '7px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                        <span style={{ fontSize: '12px', color: C.textMuted }}>Mainnet</span>
                    </div>
                </div>
            </div>

            <div style={{ position: 'relative', zIndex: 10, maxWidth: '900px', margin: '0 auto', padding: '36px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                <TransactionInput onSimulate={simulate} loading={loading} />

                {error && (
                    <div style={{
                        background: 'rgba(239,68,68,0.05)',
                        border: '1px solid rgba(239,68,68,0.18)',
                        borderRadius: '14px', padding: '18px 20px',
                    }}>
                        <p style={{ color: '#F87171', fontSize: '13px', fontWeight: 600, margin: '0 0 6px' }}>Simulation Error</p>
                        <p style={{ color: '#EF4444', fontSize: '12px', fontFamily: 'JetBrains Mono, monospace', margin: '0 0 10px', opacity: 0.8 }}>{error}</p>
                        <p style={{ color: C.textMuted, fontSize: '12px', margin: 0 }}>
                            Try a <strong style={{ color: C.hi }}>demo</strong> or paste a valid transaction signature.
                        </p>
                    </div>
                )}

                {result && <SimulationResult result={result} />}

                {!result && !loading && (
                    <div style={{ textAlign: 'center', padding: '80px 0' }}>
                        <p style={{ fontSize: '40px', marginBottom: '14px' }}>🔬</p>
                        <p style={{ fontSize: '14px', color: '#1A2530' }}>Paste a transaction above to begin analysis</p>
                    </div>
                )}
            </div>

            <footer style={{ borderTop: `1px solid ${C.border}`, padding: '20px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 10, marginTop: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#1A2530' }}>
                    <span>🧬</span><span>TX X-Ray · Built on Solana</span>
                </div>
                <div style={{ fontSize: '12px', color: C.textMuted }}>
                    Designed & Developed by <span style={{ color: C.textPrimary, fontWeight: 700 }}>Mohini</span>
                </div>
            </footer>
        </main>
    );
}
