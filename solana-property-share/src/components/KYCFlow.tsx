import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { KYCStatus } from "@/lib/types";
import { Upload, User, Mail, FileText, CheckCircle2, Clock, XCircle, Shield, ArrowRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useWallet } from "@solana/wallet-adapter-react";
import { approveUserOnChain } from "@/utils/approveUserOnChain";
import { useConnection } from "@solana/wallet-adapter-react";

interface KYCFlowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStatus: KYCStatus;
  onSubmit: (status: KYCStatus) => void;
}

export function KYCFlow({ open, onOpenChange, currentStatus, onSubmit }: KYCFlowProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    country: "",
    documentType: "passport",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { connected, publicKey, disconnect, signTransaction, signAllTransactions, wallet } = useWallet();
  const { connection } = useConnection();


  const handleSubmit = async () => {
    setIsSubmitting(true);

    // Simulate KYC submission
    await new Promise((resolve) => setTimeout(resolve, 2000));

    onSubmit("pending");

    toast({
      title: "KYC Submitted Successfully",
      description: "Your documents are being reviewed. This typically takes 1-2 business days.",
    });

    setIsSubmitting(false);
    setStep(3);
  };

  // Simulate auto-approval after submission (for demo)
  const simulateApproval = async () => {
    if (!publicKey) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const sig = await approveUserOnChain(
    {
      publicKey,
      signTransaction,
      signAllTransactions,
      connection
    },
    publicKey
  );


      console.log("KYC Approved. Tx:", sig);

      onSubmit("verified");

      toast({
        title: "KYC Approved On-Chain 🎉",
        description: `Transaction: ${sig.slice(0, 8)}...`,
      });

      onOpenChange(false);
      setStep(1);
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Approval Failed",
        description: err.message,
        variant: "destructive",
      });
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-foreground flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gold/20 flex items-center justify-center">
              <Shield className="h-5 w-5 text-gold" />
            </div>
            Identity Verification
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Complete KYC to unlock investing capabilities
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between px-4 py-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  step >= s
                    ? "bg-gold text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {step > s ? <CheckCircle2 className="h-4 w-4" /> : s}
              </div>
              {s < 3 && (
                <div
                  className={`w-16 sm:w-24 h-0.5 mx-2 ${
                    step > s ? "bg-gold" : "bg-secondary"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="p-4 space-y-6">
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-foreground">Full Legal Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="pl-10 bg-secondary border-border"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10 bg-secondary border-border"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country" className="text-foreground">Country of Residence</Label>
                <Input
                  id="country"
                  placeholder="United States"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="bg-secondary border-border"
                />
              </div>

              <Button
                variant="gold"
                className="w-full"
                onClick={() => setStep(2)}
                disabled={!formData.fullName || !formData.email || !formData.country}
              >
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-3">
                <Label className="text-foreground">Upload Identity Document</Label>
                <p className="text-sm text-muted-foreground">
                  Passport, Driver's License, or National ID
                </p>

                <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center hover:border-gold/50 transition-colors cursor-pointer">
                  <div className="h-12 w-12 rounded-xl bg-gold/20 flex items-center justify-center mx-auto mb-4">
                    <Upload className="h-6 w-6 text-gold" />
                  </div>
                  <p className="text-sm text-foreground font-medium mb-1">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG or PDF (max 10MB)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary border border-border">
                <FileText className="h-5 w-5 text-gold mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Why we need this</p>
                  <p className="text-xs text-muted-foreground">
                    Regulatory compliance requires us to verify investor identity. Your data is encrypted and secure.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button
                  variant="gold"
                  className="flex-1"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit KYC"}
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-6 animate-fade-in">
              {currentStatus === "pending" && (
                <>
                  <div className="h-16 w-16 rounded-full bg-warning/20 flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-8 w-8 text-warning" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                    Verification in Progress
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Our compliance team is reviewing your documents. This typically takes 1-2 business days.
                  </p>
                  {/* Demo button to simulate approval */}
                  <Button variant="gold" onClick={simulateApproval} className="text-xs">
                    Request Instant Approval
                  </Button>
                </>
              )}

              {currentStatus === "verified" && (
                <>
                  <div className="h-16 w-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="h-8 w-8 text-success" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                    Verified Successfully!
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    You can now invest in tokenized properties on EstateToken.
                  </p>
                  <Button variant="gold" onClick={() => onOpenChange(false)}>
                    Start Investing
                  </Button>
                </>
              )}

              {currentStatus === "rejected" && (
                <>
                  <div className="h-16 w-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-4">
                    <XCircle className="h-8 w-8 text-destructive" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                    Verification Failed
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Please contact support or try submitting again with clearer documents.
                  </p>
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Try Again
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
