import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Zap, Globe } from "lucide-react";

interface HeroSectionProps {
  onGetStarted: () => void;
}

export function HeroSection({ onGetStarted }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-gold/5 via-transparent to-transparent" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/10 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "2s" }} />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.3)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.3)_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      <div className="container relative z-10 mx-auto px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-2 animate-fade-in">
            <div className="h-2 w-2 rounded-full bg-gold animate-pulse" />
            <span className="text-sm font-medium text-gold">Live on Solana Mainnet</span>
          </div>

          {/* Headline */}
          <h1 className="mb-6 font-display text-5xl font-bold leading-tight tracking-tight text-foreground sm:text-6xl lg:text-7xl animate-slide-up" style={{ animationDelay: "0.1s" }}>
            Own a Piece of{" "}
            <span className="text-gradient-gold">Paradise</span>
          </h1>

          {/* Subheadline */}
          <p className="mb-10 text-lg text-muted-foreground sm:text-xl max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: "0.2s" }}>
            Tokenized real estate on Solana. Invest in premium properties worldwide with as little as $0.1.
            Instant settlement, full transparency, fractional ownership.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <Button variant="premium" size="xl" onClick={onGetStarted} className="group">
              Start Investing
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button variant="goldOutline" size="xl">
              <a href="#properties">View Property</a>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: "0.4s" }}>
            <div className="flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-card border border-border">
              <Shield className="h-6 w-6 text-gold" />
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground">KYC Verified</p>
                <p className="text-xs text-muted-foreground">Regulatory Compliant</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-card border border-border">
              <Zap className="h-6 w-6 text-gold" />
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground">Instant Settlement</p>
                <p className="text-xs text-muted-foreground">Powered by Solana</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-card border border-border">
              <Globe className="h-6 w-6 text-gold" />
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground">Global Access</p>
                <p className="text-xs text-muted-foreground">Invest from Anywhere</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
