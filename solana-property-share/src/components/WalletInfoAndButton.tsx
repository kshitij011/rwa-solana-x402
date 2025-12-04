// src/components/WalletInfoAndButton.tsx
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { Wallet, Shield, LogOut } from "lucide-react";
// You'll still need KYCStatus and related configs/types
import { KYCStatus } from "@/lib/types";
import { useUsdcBalance } from "@/hooks/useUsdcBalance";

// Update/Add the KYC config based on your previous structure
const kycStatusConfig: Record<KYCStatus, { label: string; color: string }> = {
  unverified: { label: "Unverified", color: "text-muted-foreground" },
  pending: { label: "Pending", color: "text-warning" },
  verified: { label: "Verified", color: "text-success" },
  rejected: { label: "Rejected", color: "text-destructive" },
};

interface WalletInfoAndButtonProps {
    kycStatus: KYCStatus;
}

export function WalletInfoAndButton({ kycStatus }: WalletInfoAndButtonProps) {
    const { connected, publicKey, disconnect } = useWallet();
    const { balance, loading } = useUsdcBalance();

    // Placeholder for balance, you'll need a custom hook to fetch the actual balance later
    // const usdcBalance = 12500.55;

    if (!connected) {
        // Renders the official Connect Wallet button
        return <WalletMultiButton />;
    }

    return (
        <div className="flex items-center gap-4">
            {/* KYC Status Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border border-border">
                <Shield className={`h-4 w-4 ${kycStatusConfig[kycStatus].color}`} />
                <span className={`text-xs font-medium ${kycStatusConfig[kycStatus].color}`}>
                    {kycStatusConfig[kycStatus].label}
                </span>
            </div>

            {/* Wallet Info */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary border border-border">
                <div className="text-right">
                    <p className="text-xs text-muted-foreground">Balance</p>
                    <p className="text-sm font-semibold text-gold">${loading ? "…" : `${balance?.toLocaleString()} USDC`}</p>
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-gold/20 flex items-center justify-center">
                        <Wallet className="h-4 w-4 text-gold" />
                    </div>
                    <span className="text-sm font-mono text-muted-foreground">
                        {publicKey?.toBase58().slice(0, 4)}...{publicKey?.toBase58().slice(-4)}
                    </span>
                </div>
                <button
                    onClick={disconnect} // Use the Solana wallet adapter's disconnect function
                    className="ml-2 p-1.5 rounded-lg hover:bg-destructive/20 transition-colors"
                >
                    <LogOut className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                </button>
            </div>
        </div>
    );
}