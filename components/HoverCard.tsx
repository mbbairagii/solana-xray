'use client';

const border = 'rgba(255,255,255,0.06)';
const borderHover = 'rgba(255,255,255,0.11)';

interface Props {
    children: React.ReactNode;
    style?: React.CSSProperties;
}

export function HoverCard({ children, style }: Props) {
    return (
        <div
            style={{ border: `1px solid ${border}`, transition: 'border-color 0.2s', cursor: 'default', ...style }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = borderHover; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = border; }}
        >
            {children}
        </div>
    );
}
