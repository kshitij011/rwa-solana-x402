import { useState, useCallback } from "react";
import { KYCStatus } from "@/lib/types"
import { PublicKey } from "@solana/web3.js";;

export function useKyc() {
  const [kycStatus, setKycStatus] = useState<KYCStatus>("unverified");

  const updateKycStatus = useCallback((status: KYCStatus) => {
    setKycStatus(status);
  }, []);

  const approveUser = useCallback(async (user: PublicKey) => {
    const res = await fetch("/api/approveUser", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: user.toBase58() })
    });

    const data = await res.json();
    return data;
  }, []);

  return {
    kycStatus,
    updateKycStatus,
    approveUser
  };
}
