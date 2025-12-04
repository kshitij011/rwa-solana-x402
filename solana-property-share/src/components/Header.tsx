// import { Button } from "@/components/ui/button";
// import { Wallet, LogOut, Shield, ChevronDown } from "lucide-react";
import { WalletInfoAndButton } from "./WalletInfoAndButton";
import { KYCStatus } from "@/lib/types";

interface HeaderProps {
  // wallet: WalletState;
  kycStatus: KYCStatus;
  // onConnect: () => void;
  // onDisconnect: () => void;
}

const kycStatusConfig: Record<KYCStatus, { label: string; color: string }> = {
  unverified: { label: "Unverified", color: "text-muted-foreground" },
  pending: { label: "Pending", color: "text-warning" },
  verified: { label: "Verified", color: "text-success" },
  rejected: { label: "Rejected", color: "text-destructive" },
};

export function Header({ kycStatus }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-20 items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-gold flex items-center justify-center shadow-lg">
            <span className="font-display text-xl font-bold text-primary-foreground">E</span>
          </div>
          <div>
            <h1 className="font-display text-xl font-semibold text-foreground">EstateToken</h1>
            <p className="text-xs text-muted-foreground">Powered by Solana</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="#kyc" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            KYC
          </a>
          <a href="#properties" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Properties
          </a>
          <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            How It Works
          </a>
        </nav>

        {/* Wallet Section */}
        <div className="flex items-center gap-4">
          <WalletInfoAndButton kycStatus={kycStatus} />
        </div>
      </div>
    </header>
  );
}
