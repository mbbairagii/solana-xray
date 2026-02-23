import { AccountChange } from '@/lib/types';

interface Props { accounts: AccountChange[]; }

function toSOL(l: number) { return (l / 1e9).toFixed(4); }

export function AccountDiff({ accounts }: Props) {
    if (!accounts.length)
        return <p style={{ color: '#374151', fontSize: '13px' }}>No account state changes captured.</p>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {accounts.map((acc, i) => {
                const delta = acc.after.lamports - acc.before.lamports;
                return (
                    <div key={i} style={{ background: '#080B10', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '18px 20px' }}>
                        <p style={{ fontFamily: 'monospace', fontSize: '12px', color: '#4B5563', marginBottom: '14px' }}>
                            {acc.label ?? `${acc.pubkey.slice(0, 8)}…${acc.pubkey.slice(-6)}`}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px' }}>
                            <span style={{ color: '#4B5563', minWidth: '40px', fontWeight: 600 }}>SOL</span>
                            <span style={{ color: '#6B7280', fontFamily: 'monospace' }}>{toSOL(acc.before.lamports)}</span>
                            <span style={{ color: '#374151' }}>→</span>
                            <span style={{ fontWeight: 700, fontFamily: 'monospace', color: delta < 0 ? '#F87171' : delta > 0 ? '#14F195' : '#6B7280' }}>
                                {toSOL(acc.after.lamports)}
                            </span>
                            {delta !== 0 && (
                                <span style={{ fontSize: '12px', color: delta < 0 ? '#F87171' : '#14F195' }}>
                                    ({delta > 0 ? '+' : ''}{toSOL(delta)})
                                </span>
                            )}
                        </div>
                        {acc.isClosed && (
                            <span style={{ marginTop: '10px', display: 'inline-block', fontSize: '12px', background: 'rgba(239,68,68,0.1)', color: '#FCA5A5', padding: '4px 12px', borderRadius: '8px' }}>
                                🚨 ACCOUNT CLOSED
                            </span>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
