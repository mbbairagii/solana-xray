'use client';

import { useRouter } from 'next/navigation';

interface Props {
    label: string;
    padding?: string;
}

const hi = '#7EB8C9';

export function SimulateButton({ label, padding = '13px 34px' }: Props) {
    const router = useRouter();

    return (
        <button
            onClick={() => router.push('/app')}
            style={{
                background: hi,
                color: '#07090B',
                fontWeight: 700,
                fontSize: '13px',
                padding,
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                letterSpacing: '-0.1px',
                transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.opacity = '0.85';
                (e.target as HTMLButtonElement).style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.opacity = '1';
                (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
            }}
        >
            {label}
        </button>
    );
}
