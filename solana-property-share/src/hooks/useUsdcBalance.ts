// src/hooks/useUsdcBalance.ts
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useState, useEffect } from "react";
import { PublicKey } from "@solana/web3.js";

const USDC_DEVNET = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");

export function useUsdcBalance() {
    const { connection } = useConnection();
    const { publicKey } = useWallet();

    const [balance, setBalance] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!publicKey) {
            setBalance(null);
            return;
        }

        const fetchBalance = async () => {
            try {
                setLoading(true);

                // Fetch all token accounts for owner filtered by mint
                const accounts = await connection.getParsedTokenAccountsByOwner(
                    publicKey,
                    { mint: USDC_DEVNET }
                );

                if (accounts.value.length === 0) {
                    setBalance(0);
                    return;
                }

                const tokenAmount =
                    accounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;

                setBalance(tokenAmount ?? 0);
            } finally {
                setLoading(false);
            }
        };

        fetchBalance();
    }, [publicKey, connection]);

    return { balance, loading };
}
