import type { Config } from 'tailwindcss';

const config: Config = {
    content: ['./src/**/*.{ts,tsx,js,jsx}'],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
                mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
            },
            colors: {
                sol: {
                    green: '#14F195',
                    dark: '#080B10',
                    card: '#0D1117',
                    border: '#1E2433',
                },
            },
            backgroundImage: {
                'glow-green': 'radial-gradient(ellipse at center, rgba(20,241,149,0.08) 0%, transparent 70%)',
            },
        },
    },
    plugins: [],
};

export default config;
