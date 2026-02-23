import { CPINode } from '@/lib/types';

interface Props { nodes: CPINode[]; }

function Node({ node, isLast }: { node: CPINode; isLast: boolean }) {
    return (
        <div style={{ marginLeft: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '6px 0' }}>
                <span style={{ color: '#374151', fontFamily: 'monospace', fontSize: '13px' }}>{isLast ? '└─' : '├─'}</span>
                <span style={{ fontSize: '12px', fontWeight: 600, padding: '3px 10px', borderRadius: '8px', background: node.programName === 'Unknown Program' ? 'rgba(245,158,11,0.1)' : 'rgba(129,140,248,0.1)', color: node.programName === 'Unknown Program' ? '#FCD34D' : '#818CF8' }}>
                    {node.programName}
                </span>
                <span style={{ fontSize: '11px', color: '#374151', fontFamily: 'monospace' }}>{node.programId.slice(0, 8)}…</span>
            </div>
            {node.children.map((child, i) => (
                <Node key={i} node={child} isLast={i === node.children.length - 1} />
            ))}
        </div>
    );
}

export function CPITree({ nodes }: Props) {
    if (!nodes.length)
        return <p style={{ color: '#374151', fontSize: '13px' }}>No CPI data available from logs.</p>;

    return (
        <div style={{ background: '#080B10', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '20px' }}>
            <p style={{ fontSize: '11px', color: '#374151', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>Call Stack</p>
            {nodes.map((node, i) => (
                <div key={i}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#14F195' }}>⬛ User Tx</span>
                        <span style={{ color: '#374151' }}>→</span>
                        <span style={{ fontSize: '12px', fontWeight: 600, padding: '3px 10px', borderRadius: '8px', background: 'rgba(129,140,248,0.1)', color: '#818CF8' }}>{node.programName}</span>
                    </div>
                    {node.children.map((child, j) => (
                        <Node key={j} node={child} isLast={j === node.children.length - 1} />
                    ))}
                </div>
            ))}
        </div>
    );
}
