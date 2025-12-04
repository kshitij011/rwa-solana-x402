import { Property } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MapPin, TrendingUp, Lock, ArrowRight } from "lucide-react";
import { PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";
import { getUserShares } from "@/utils/getUserShares";
import * as anchor from "@coral-xyz/anchor";
import { useConnection } from "@solana/wallet-adapter-react";


interface PropertyListingsProps {
  properties: Property[];
  isVerified: boolean;
  onSelectProperty: (property: Property) => void;
  wallet: PublicKey | null;
  refreshKey: number;
}

export function PropertyListings({ properties, isVerified, onSelectProperty, wallet, refreshKey }: PropertyListingsProps) {

  const { connection } = useConnection();
  const [ownedShares, setOwnedShares] = useState<Record<number, number>>({});

  useEffect(() => {
    if (!wallet) return;

    const provider = new anchor.AnchorProvider(connection, {} as any, {});

    (async () => {
      const results: Record<number, number> = {};

      for (const prop of properties) {
        const shares = await getUserShares(provider, wallet, Number(prop.id));
        results[prop.id] = shares;
      }

      setOwnedShares(results);
    })();
  }, [wallet, properties, connection, refreshKey]);

  return (
    <section id="properties" className="py-24 px-6">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 border border-success/30 text-success text-xs font-medium mb-4">
            <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            Live Offerings
          </div>
          <h2 className="font-display text-4xl font-bold text-foreground mb-4">
            Property <span className="text-gradient-gold">Listings</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Premium real estate opportunities tokenized on Solana. Each property is legally verified and professionally managed.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property) => {
            const fundingPercentage = (property.sharesSold / property.totalShares) * 100;
            const remainingShares = property.totalShares - property.sharesSold;

            return (
              <div
                key={property.id}
                className="group rounded-3xl bg-gradient-card border border-border overflow-hidden transition-all duration-300 hover:border-gold/30 hover:shadow-[0_0_60px_hsl(42_100%_50%/0.1)]"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={property.images[0]}
                    alt={property.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

                  {/* Yield Badge */}
                  <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-gold/90 text-primary-foreground text-sm font-semibold flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5" />
                    {property.projectedYield}% APY
                  </div>

                  {/* Location */}
                  <div className="absolute bottom-4 left-4 flex items-center gap-2 text-foreground">
                    <MapPin className="h-4 w-4 text-gold" />
                    <span className="text-sm font-medium">{property.location}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                      {property.name}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {property.description}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-xl bg-secondary">
                      <p className="text-xs text-muted-foreground">Property Value</p>
                      <p className="text-lg font-bold text-foreground">
                        ${(property.propertyValue / 1000000).toFixed(1)}M
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-secondary">
                      <p className="text-xs text-muted-foreground">Share Price</p>
                      <p className="text-lg font-bold text-gold">
                        ${property.pricePerShare}
                      </p>
                    </div>
                  </div>

                  {/* Funding Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Funding Progress</span>
                      <span className="text-gold font-medium">{fundingPercentage.toFixed(0)}%</span>
                    </div>
                    <Progress value={fundingPercentage} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {remainingShares.toLocaleString()} shares remaining
                    </p>
                  </div>

                  {/* My Shares */}
                  {wallet && (
                    <div className="p-3 rounded-xl bg-secondary border border-border">
                      <p className="text-xs text-muted-foreground">Shares owned</p>
                      <p className="text-lg font-semibold text-gold">
                        {ownedShares[property.id] ?? 0}
                      </p>
                    </div>
                  )}


                  {/* CTA Button */}
                  <Button
                    variant={isVerified ? "gold" : "outline"}
                    className="w-full group/btn"
                    onClick={() => onSelectProperty(property)}
                  >
                    {isVerified ? (
                      <>
                        Invest Now
                        <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-1" />
                        KYC Required
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
