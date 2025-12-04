// src/hooks/useX402Client.ts
import { useWallet } from "@solana/wallet-adapter-react";
import { createX402Client } from "x402-solana/client";
import { useMemo } from "react";

export function useX402Client(maxPaymentAmount: bigint = BigInt(1_000_000_000)) {
  const wallet = useWallet();

  const client = useMemo(() => {
    if (!wallet.connected || !wallet.publicKey) return null;

    return createX402Client({
      wallet: {
        address: wallet.publicKey.toString(),
        signTransaction: async (tx) => {
          if (!wallet.signTransaction)
            throw new Error("Wallet cannot sign transactions");
          return await wallet.signTransaction(tx);
        },
      },
      network: "solana-devnet",
      maxPaymentAmount,
    });
  }, [wallet.connected, wallet.publicKey, wallet.signTransaction, maxPaymentAmount]);

  return client;
}
