import { RiskAnalysis } from '@/lib/types';

interface Props { risk: RiskAnalysis; }

const cfg = {
    safe: { label: 'SAFE', color: '#10B981', glow: 'rgba(16,185,129,0.1)', bar: 'linear-gradient(90deg,#10B981,#34D399)' },
    review: { label: 'REVIEW', color: '#F59E0B', glow: 'rgba(245,158,11,0.1)', bar: 'linear-gradient(90deg,#F59E0B,#FBBF24)' },
    danger: { label: 'HIGH RISK', color: '#EF4444', glow: 'rgba(239,68,68,0.1)', bar: 'linear-gradient(90deg,#EF4444,#DC2626)' },
};

const C = {
    cardInner: '#07090B',
    border: 'rgba(255,255,255,0.06)',
    textPrimary: '#F1F5F9',
    textMuted: '#475569',
    textFaint: '#2A3A47',
};

export function RiskScore({ risk }: Props) {
    const c = cfg[risk.level];

    return (
        <div style={{
            background: C.cardInner,
            border: `1px solid ${c.glow}`,
            borderRadius: '16px',
            padding: '24px',
            boxShadow: `0 0 28px ${c.glow}`,
        }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '11px', color: C.textMuted, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                    Risk Score
                </span>
                <span style={{ fontSize: '28px', fontWeight: 900, color: c.color, letterSpacing: '-1px' }}>
                    {risk.score === 0 ? '—' : risk.score}
                    <span style={{ fontSize: '13px', fontWeight: 500, color: C.textMuted }}>/100</span>
                </span>
            </div>

            <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px', overflow: 'hidden', marginBottom: '10px' }}>
                <div style={{ height: '100%', width: `${risk.score}%`, background: c.bar, borderRadius: '99px', transition: 'width 0.8s ease' }} />
            </div>

            {risk.score === 0 ? (
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#10B981', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                    No Risk Detected
                </span>
            ) : (
                <span style={{ fontSize: '11px', fontWeight: 800, color: c.color, letterSpacing: '2px', textTransform: 'uppercase' }}>
                    {c.label}
                </span>
            )}

            {risk.factors.length > 0 && (
                <div style={{ marginTop: '22px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <p style={{ fontSize: '10px', color: C.textFaint, textTransform: 'uppercase', letterSpacing: '1.5px', margin: 0 }}>
                        Risk Factors
                    </p>
                    {risk.factors.map((f, i) => (
                        <div key={i} style={{ display: 'flex', gap: '14px' }}>
                            <span style={{ color: '#EF4444', fontWeight: 700, minWidth: '36px', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px' }}>
                                +{f.weight}
                            </span>
                            <div>
                                <p style={{ color: C.textPrimary, fontWeight: 600, margin: '0 0 2px', fontSize: '13px' }}>{f.name}</p>
                                <p style={{ color: C.textMuted, margin: 0, fontSize: '12px', lineHeight: 1.5 }}>{f.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div style={{ marginTop: '22px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <p style={{ fontSize: '10px', color: C.textFaint, textTransform: 'uppercase', letterSpacing: '1.5px', margin: '0 0 8px' }}>
                    Scam Heuristics
                </p>
                {risk.heuristics.map((h) => (
                    <div key={h.id} style={{
                        display: 'flex', alignItems: 'flex-start', gap: '10px',
                        padding: '8px 12px', borderRadius: '8px',
                        background: h.triggered ? 'rgba(239,68,68,0.06)' : 'transparent',
                        border: h.triggered ? '1px solid rgba(239,68,68,0.15)' : '1px solid rgba(255,255,255,0.04)',
                    }}>
                        <span style={{
                            fontSize: '12px',
                            color: h.triggered ? '#EF4444' : '#3D4F5C',
                            fontWeight: 700,
                            marginTop: '1px',
                            flexShrink: 0,
                        }}>
                            {h.triggered ? '✕' : '✓'}
                        </span>
                        <div>
                            <span style={{
                                fontSize: '13px',
                                fontWeight: h.triggered ? 600 : 400,
                                color: h.triggered ? '#FCA5A5' : '#475569',
                            }}>
                                {h.name}
                            </span>
                            {h.triggered && (
                                <p style={{
                                    fontSize: '11px', color: '#EF4444', opacity: 0.65,
                                    margin: '3px 0 0', lineHeight: 1.5,
                                }}>
                                    {h.description}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
