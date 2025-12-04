import { useState, useCallback } from "react";
import { WalletState, KYCStatus } from "@/lib/types";

// Mock wallet hook - in production, integrate with @solana/wallet-adapter-react
export function useWallet() {
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    address: null,
    balance: null,
    usdcBalance: null,
  });

  const [kycStatus, setKycStatus] = useState<KYCStatus>("unverified");

  const connect = useCallback(async () => {
    // Simulate wallet connection
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    setWallet({
      connected: true,
      address: "7nYz...mock...wallet",
      balance: 5.234,
      usdcBalance: 2500.00,
    });
  }, []);

  const disconnect = useCallback(() => {
    setWallet({
      connected: false,
      address: null,
      balance: null,
      usdcBalance: null,
    });
    setKycStatus("unverified");
  }, []);

  const updateKycStatus = useCallback((status: KYCStatus) => {
    setKycStatus(status);
  }, []);

  return {
    wallet,
    kycStatus,
    connect,
    disconnect,
    updateKycStatus,
  };
}
