import type { Metadata } from 'next';
import './globals.css';
import '@solana/wallet-adapter-react-ui/styles.css';
import './wallet-override.css';

import '@/app/polyfills';
import { SolanaWalletProvider } from '@/components/WalletProvider';

export const metadata: Metadata = {
  title: 'Solana TX X-Ray | Transaction Simulator',
  description: 'Simulate, decode, and risk-analyze Solana transactions before signing',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SolanaWalletProvider>{children}</SolanaWalletProvider>
      </body>
    </html>
  );
}
