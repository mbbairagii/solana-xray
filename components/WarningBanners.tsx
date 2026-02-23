import { Warning } from '@/lib/types';

interface Props { warnings: Warning[]; }

const styles = {
    info: { border: 'rgba(96,165,250,0.2)', bg: 'rgba(96,165,250,0.05)', color: '#93C5FD', tag: 'INFO' },
    warning: { border: 'rgba(245,158,11,0.2)', bg: 'rgba(245,158,11,0.05)', color: '#FCD34D', tag: 'CAUTION' },
    danger: { border: 'rgba(239,68,68,0.2)', bg: 'rgba(239,68,68,0.05)', color: '#FCA5A5', tag: 'DANGER' },
};

export function WarningBanners({ warnings }: Props) {
    if (!warnings.length) return null;
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {warnings.map((w, i) => {
                const s = styles[w.type];
                return (
                    <div key={i} style={{
                        border: `1px solid ${s.border}`, background: s.bg,
                        borderRadius: '12px', padding: '12px 16px',
                        display: 'flex', gap: '12px', alignItems: 'flex-start',
                    }}>
                        <span style={{
                            fontSize: '10px', fontWeight: 800, color: s.color,
                            letterSpacing: '1px', padding: '2px 7px',
                            background: `rgba(255,255,255,0.05)`, borderRadius: '4px',
                            whiteSpace: 'nowrap', marginTop: '1px', border: `1px solid ${s.border}`,
                        }}>
                            {s.tag}
                        </span>
                        <div>
                            <p style={{ fontWeight: 700, fontSize: '13px', color: s.color, margin: '0 0 3px' }}>{w.title}</p>
                            <p style={{ fontSize: '12px', color: s.color, opacity: 0.65, margin: 0, lineHeight: 1.6 }}>{w.description}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
