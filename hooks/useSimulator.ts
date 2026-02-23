import { useState, useCallback } from 'react';
import { SimulationResult } from '@/lib/types';
import { simulateFromBase64, connection } from '@/lib/simulator';
import { useWallet } from '@solana/wallet-adapter-react';

export function useSimulator() {
    const [result, setResult] = useState<SimulationResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [history, setHistory] = useState<{ input: string; result: SimulationResult }[]>([]);
    const wallet = useWallet();

    const simulate = useCallback(async (input: string) => {
        setLoading(true);
        setError(null);
        try {
            const res = await simulateFromBase64(input.trim());
            setResult(res);
            setHistory((prev) => [{ input: input.trim(), result: res }, ...prev.slice(0, 9)]);
        } catch (e: any) {
            setError(e?.message ?? 'Simulation failed');
        } finally {
            setLoading(false);
        }
    }, []);

    const reset = useCallback(() => {
        setResult(null);
        setError(null);
    }, []);

    const fetchWalletHistory = useCallback(async () => {
        if (!wallet.publicKey) return [];
        const sigs = await connection.getSignaturesForAddress(wallet.publicKey, { limit: 10 });
        return sigs.map((s) => s.signature);
    }, [wallet.publicKey]);

    return { result, loading, error, simulate, reset, history, fetchWalletHistory };
}
