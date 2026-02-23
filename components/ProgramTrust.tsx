import { DecodedInstruction } from '@/lib/types';
import { getProgramInfo } from '@/lib/programRegistry';

interface Props { instructions: DecodedInstruction[]; }

export function ProgramTrust({ instructions }: Props) {
    const unique = [...new Set(instructions.map((ix) => ix.programId))];
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {unique.map((pid) => {
                const info = getProgramInfo(pid);
                return (
                    <div key={pid} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#080B10', border: `1px solid ${info.verified ? 'rgba(20,241,149,0.15)' : 'rgba(245,158,11,0.2)'}`, borderRadius: '14px', padding: '16px 20px' }}>
                        <div>
                            <p style={{ fontSize: '14px', fontWeight: 600, color: '#F9FAFB', margin: '0 0 4px' }}>{info.name}</p>
                            <p style={{ fontSize: '11px', color: '#4B5563', fontFamily: 'monospace', margin: '0 0 4px' }}>{pid.slice(0, 20)}…</p>
                            {info.description && <p style={{ fontSize: '12px', color: '#374151', margin: 0 }}>{info.description}</p>}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '12px', fontWeight: 700, padding: '4px 12px', borderRadius: '99px', background: info.verified ? 'rgba(20,241,149,0.1)' : 'rgba(245,158,11,0.1)', color: info.verified ? '#14F195' : '#FCD34D', display: 'block', marginBottom: '6px' }}>
                                {info.verified ? '✓ Verified' : '? Unknown'}
                            </span>
                            {info.tag && <p style={{ fontSize: '11px', color: '#818CF8', margin: 0 }}>{info.tag}</p>}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
