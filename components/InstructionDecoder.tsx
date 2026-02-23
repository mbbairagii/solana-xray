import { DecodedInstruction } from '@/lib/types';

interface Props {
    instructions: DecodedInstruction[];
    mode: 'dev' | 'simple';
}

export function InstructionDecoder({ instructions, mode }: Props) {
    if (!instructions.length)
        return (
            <p style={{ color: '#374151', fontSize: '13px' }}>
                No instructions decoded. Try the Logs tab to see raw execution output.
            </p>
        );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {instructions.map((ix) => (
                <div
                    key={ix.index}
                    style={{
                        background: '#080B10',
                        border: `1px solid ${ix.isKnown ? 'rgba(255,255,255,0.07)' : 'rgba(245,158,11,0.25)'}`,
                        borderRadius: '14px',
                        padding: '18px 20px',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span style={{
                            fontSize: '11px', fontWeight: 700, color: '#14F195',
                            letterSpacing: '1px', textTransform: 'uppercase',
                        }}>
                            #{ix.index + 1} · {ix.type}
                        </span>
                        <span style={{
                            fontSize: '11px', fontWeight: 700, padding: '3px 10px',
                            borderRadius: '99px',
                            background: ix.isKnown ? 'rgba(20,241,149,0.1)' : 'rgba(245,158,11,0.1)',
                            color: ix.isKnown ? '#14F195' : '#FCD34D',
                        }}>
                            {ix.isKnown ? 'Verified' : 'Unknown'}
                        </span>
                    </div>

                    {mode === 'simple' && (
                        <p style={{ fontSize: '14px', color: '#D1D5DB', margin: 0, lineHeight: 1.7 }}>
                            {ix.description}
                        </p>
                    )}

                    {mode === 'dev' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <p style={{ fontSize: '14px', color: '#D1D5DB', margin: 0, lineHeight: 1.7 }}>
                                {ix.description}
                            </p>
                            <div style={{
                                marginTop: '8px', paddingTop: '12px',
                                borderTop: '1px solid rgba(255,255,255,0.05)',
                                display: 'flex', flexDirection: 'column', gap: '8px',
                            }}>
                                <div style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
                                    <span style={{ color: '#374151', minWidth: '90px', flexShrink: 0 }}>Program ID</span>
                                    <span style={{ color: '#818CF8', fontFamily: 'JetBrains Mono, monospace', wordBreak: 'break-all', fontSize: '11px' }}>
                                        {ix.programId}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
                                    <span style={{ color: '#374151', minWidth: '90px', flexShrink: 0 }}>Program</span>
                                    <span style={{ color: '#9CA3AF', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px' }}>
                                        {ix.programName}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', fontSize: '12px', alignItems: 'flex-start' }}>
                                    <span style={{ color: '#374151', minWidth: '90px', flexShrink: 0 }}>Accounts</span>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        {ix.accounts.slice(0, 5).map((acc, i) => (
                                            <span key={i} style={{
                                                color: '#6B7280', fontFamily: 'JetBrains Mono, monospace',
                                                fontSize: '11px', wordBreak: 'break-all',
                                            }}>
                                                [{i}] {acc}
                                            </span>
                                        ))}
                                        {ix.accounts.length > 5 && (
                                            <span style={{ color: '#374151', fontSize: '11px' }}>
                                                +{ix.accounts.length - 5} more accounts
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
                                    <span style={{ color: '#374151', minWidth: '90px', flexShrink: 0 }}>Raw Data</span>
                                    <span style={{
                                        color: '#6B7280', fontFamily: 'JetBrains Mono, monospace',
                                        fontSize: '11px', wordBreak: 'break-all',
                                    }}>
                                        {ix.data.slice(0, 80)}{ix.data.length > 80 ? '…' : ''}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
