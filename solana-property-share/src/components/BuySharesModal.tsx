import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Property, WalletState } from "@/lib/types";
import { Minus, Plus, Wallet, ArrowRight, CheckCircle2, Loader2, Copy, ExternalLink } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useUsdcBalance } from "@/hooks/useUsdcBalance";
import { useX402Client } from "@/lib/x402Client";
import { mintShares } from "@/utils/mintShares";
import { useWallet } from "@solana/wallet-adapter-react";

interface BuySharesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: Property;
  onSharesMinted: () => void;
}

export function BuySharesModal({ open, onOpenChange, property, onSharesMinted }: BuySharesModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [txHash, setTxHash] = useState("");
  const { balance, loading } = useUsdcBalance();
  const [mintTxHash, setMintTxHash] = useState("");

  const totalCost = (quantity * property.pricePerShare);
  const canAfford = (balance || 0) >= totalCost;
  const remainingShares = property.totalShares - property.sharesSold;

  const client = useX402Client();
  const wallet = useWallet();

  const explorerUrl = txHash
    ? `https://explorer.solana.com/tx/${txHash}?cluster=devnet`
    : '#';

  const slicedTxHash = txHash
    ? `${txHash.slice(0, 8)}...${txHash.slice(-8)}`
    : 'N/A';

  const mintExplorerUrl = mintTxHash
  ? `https://explorer.solana.com/tx/${mintTxHash}?cluster=devnet`
  : '#';

  const slicedMintHash = mintTxHash
    ? `${mintTxHash.slice(0, 8)}...${mintTxHash.slice(-8)}`
    : 'N/A';


  console.log("Property Id: ", property.id);

  const handleCopy = async () => {
    if (!txHash) return;

    try {
      await navigator.clipboard.writeText(txHash);

      toast({
        title: "Transaction Hash Copied!",
        description: "The full transaction hash is now in your clipboard.",
      });
    } catch (err) {
      console.error("Clipboard failed:", err);

      toast({
        title: "Copy Failed",
        description: "Clipboard access blocked — please copy manually.",
        variant: "destructive",
      });
    }
  };


  const handleCopyMint = async () => {
    if (!mintTxHash) return;
    try {
      await navigator.clipboard.writeText(mintTxHash);
      toast({
        title: "Mint Transaction Copied",
        description: "The full transaction hash is now in your clipboard.",
      });
    } catch {
      toast({
        title: "Copy Failed",
        description: "Clipboard access blocked — please copy manually.",
        variant: "destructive",
      });
    }
  };

  const handleViewMintExplorer = () => {
    if (mintTxHash) window.open(mintExplorerUrl, "_blank");
  };



  const handleViewExplorer = () => {
    if (txHash) {
      window.open(explorerUrl, '_blank');
    }
  };

  const handleQuantityChange = (delta: number) => {
    const newQty = Math.max(1, Math.min(property.maxInvestment, quantity + delta, remainingShares));
    setQuantity(newQty);
  };

  const handlePurchase = async () => {
    if (!canAfford) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough USDC to complete this purchase.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsPurchasing(true);

      const response = await client.fetch(
        "http://localhost:4000/api/paid-endpoint",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-total-cost": String(totalCost),        // 👈 add amount here
            "x-property-id": property.id,             // optional metadata
            "x-quantity": String(quantity),
          },
          body: JSON.stringify({
            propertyId: property.id,
            quantity,
            cost: totalCost,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Payment failed or rejected by server");
      }

      const json = await response.json();
      setTxHash(json.txHash)

      console.log("Successfull? ", json.ok)

      if (json.ok) {
        try {
          const mintTx = await mintShares({
            wallet,
            propertyId: Number(property.id),
            quantity,
          });

          setMintTxHash(mintTx);
          console.log("Mint Success:", mintTx);
          onSharesMinted();

        } catch (e) {
          console.error("Minting failed:", e);
          toast({
            title: "Mint Failed",
            description: "Your payment went through but token minting failed.",
            variant: "destructive",
          });
        }
      }


      setIsPurchasing(false);
      setIsSuccess(true);

      toast({
        title: "Purchase Successful 🎉",
        description: `You purchased ${quantity} shares! ${txHash}!!`,
      });
    } catch (err: any) {
      setIsPurchasing(false);

      toast({
        title: "Payment Failed",
        description: err.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setIsSuccess(false);
    setQuantity(1);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-foreground">
            {isSuccess ? "Purchase Complete" : "Buy Property Shares"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isSuccess ? "Your transaction was successful" : property.name}
          </DialogDescription>
        </DialogHeader>

        {!isSuccess ? (
          <div className="space-y-6 py-4">
            {/* Quantity Selector */}
            <div className="space-y-3">
              <Label className="text-foreground">Number of Shares</Label>
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="h-12 w-12 rounded-xl"
                >
                  <Minus className="h-5 w-5" />
                </Button>
                <Input
                  type="number"
                  value={quantity}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(property.maxInvestment, parseInt(e.target.value) || 1, remainingShares)))}
                  className="w-24 h-14 text-center text-2xl font-bold bg-secondary border-border"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= property.maxInvestment || quantity >= remainingShares}
                  className="h-12 w-12 rounded-xl"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
              <p className="text-xs text-center text-muted-foreground">
                Max {Math.min(property.maxInvestment, remainingShares)} shares per user
              </p>
            </div>

            {/* Cost Breakdown */}
            <div className="p-4 rounded-2xl bg-secondary border border-border space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Price per share</span>
                <span className="text-foreground">${property.pricePerShare} USDC</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Quantity</span>
                <span className="text-foreground">× {quantity}</span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex justify-between">
                <span className="font-medium text-foreground">Total</span>
                <span className="text-xl font-bold text-gold">${totalCost.toLocaleString()} USDC</span>
              </div>
            </div>

            {/* Wallet Balance */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Your Balance</span>
              </div>
              <span className={`text-sm font-semibold ${canAfford ? "text-success" : "text-destructive"}`}>
                ${loading ? "…" : `${balance?.toLocaleString()} USDC`}
              </span>
            </div>

            {/* Purchase Button */}
            <Button
              variant="premium"
              size="lg"
              className="w-full"
              onClick={handlePurchase}
              disabled={!canAfford || isPurchasing}
            >
              {isPurchasing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing Transaction...
                </>
              ) : (
                <>
                  Confirm Purchase
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>

            {!canAfford && (
              <p className="text-xs text-center text-destructive">
                Insufficient USDC balance to complete this purchase
              </p>
            )}
          </div>
        ) : (
          <div className="py-8 text-center animate-scale-in">
            <div className="h-20 w-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-success" />
            </div>
            <h3 className="font-display text-2xl font-bold text-foreground mb-2">
              Congratulations!
            </h3>
            <p className="text-muted-foreground mb-6">
              You now own <span className="text-gold font-semibold">{quantity} shares</span> of {property.name}
            </p>
            <div className="p-4 rounded-xl bg-secondary border border-border mb-6">
              {/* NEW: Transaction Hash Display and Copy */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">


  {/* PAYMENT BOX */}
  <div className="p-4 rounded-xl bg-secondary border border-border">
    <p className="text-sm font-semibold text-muted-foreground mb-3">
      Payment Transaction (X402)
    </p>

    {/* Hash + Copy */}
    <div className="flex items-center bg-secondary border border-border rounded-xl p-2 shadow-inner">
      <Input
        type="text"
        value={slicedTxHash}
        readOnly
        className="flex-grow font-mono text-xs md:text-sm bg-transparent border-none focus:ring-0 px-1"
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={handleCopy}
        className="ml-2 w-8 h-8 flex-shrink-0 hover:bg-muted/50"
      >
        <Copy className="h-4 w-4" />
      </Button>
    </div>

    <Button
      variant="outline"
      className="w-full mt-3 text-xs md:text-sm text-foreground hover:bg-gold/10 border-gold/50 flex-nowrap truncate"

      onClick={handleViewExplorer}
    >
      <ExternalLink className="h-4 w-4 mr-2 overflow-hidden" />
      View on Solana Explorer
    </Button>
  </div>


  {/* MINTING BOX */}
  <div className="p-4 rounded-xl bg-secondary border border-border">
    <p className="text-sm font-semibold text-muted-foreground mb-3">
      Minting Transaction Hash
    </p>

    {/* Hash + Copy */}
    <div className="flex items-center bg-secondary border border-border rounded-xl p-2 shadow-inner">
      <Input
        type="text"
        value={slicedMintHash}
        readOnly
        className="flex-grow font-mono text-xs md:text-sm bg-transparent border-none focus:ring-0 px-1"
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={handleCopyMint}
        className="ml-2 w-8 h-8 flex-shrink-0 hover:bg-muted/50"
      >
        <Copy className="h-4 w-4" />
      </Button>
    </div>

    <Button
  variant="outline"
  className="w-full mt-3 text-xs md:text-sm text-foreground hover:bg-gold/10 border-gold/50 flex-nowrap truncate"
  onClick={handleViewMintExplorer}
  disabled={!mintTxHash}
>
  <ExternalLink className="h-4 w-4 mr-2" />
  View on Solana Explorer
</Button>

  </div>

</div>

            {/* END NEW BLOCK */}
            </div>
            <Button variant="gold" onClick={handleClose}>
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
