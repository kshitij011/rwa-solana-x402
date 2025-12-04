import { useState } from "react";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { KYCSection } from "@/components/KYCSection";
import { PropertyListings } from "@/components/PropertyListings";
import { HowItWorks } from "@/components/HowItWorks";
import { KYCFlow } from "@/components/KYCFlow";
import { BuySharesModal } from "@/components/BuySharesModal";
import { Footer } from "@/components/Footer";
import { useKyc } from "@/hooks/useKyc";
import { PROPERTIES } from "@/lib/constants";
import { Property } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import { useWallet } from "@solana/wallet-adapter-react";



const Index = () => {
  const { kycStatus, updateKycStatus } = useKyc();

  const { connected, publicKey, disconnect, connect } = useWallet();

  const [showKYC, setShowKYC] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [sharesRefreshKey, setSharesRefreshKey] = useState(0);

  const handleGetStarted = () => {
    if (!connected) {
      toast({
        title: "Connect Wallet",
        description: "Please connect your wallet to start.",
      });

      return;
    }

    if (kycStatus !== "verified") {
      setShowKYC(true);
    }
  };


    const handleSelectProperty = async(property: Property) => {
      try {
      if (!connected) {
    toast({
      title: "Connect Wallet",
      description: "Please connect your wallet to continue.",
      variant: "destructive",
    });
    return;
  }


    if (kycStatus !== "verified") {
      setShowKYC(true);
      return;
    }

    setSelectedProperty(property);
    setShowBuyModal(true);

  } catch (err) {
    console.error(err);

    toast({
      title: "Wallet Connection Failed",
      description: "Please select a wallet first.",
      variant: "destructive",
    });
  }
  };



  return (
    <div className="min-h-screen bg-background">
      <Header
        kycStatus={kycStatus}
      />

      <main>
        <HeroSection onGetStarted={handleGetStarted} />

        <KYCSection
          isConnected={connected}
          kycStatus={kycStatus}
          onStartKYC={() => setShowKYC(true)}
          onConnect={connect}
        />

        <PropertyListings
          properties={PROPERTIES}
          isVerified={kycStatus === "verified"}
          onSelectProperty={handleSelectProperty}
          wallet={publicKey}
          refreshKey={sharesRefreshKey}
        />

        <HowItWorks />
      </main>

      <Footer />

      {/* Modals */}
      <KYCFlow
        open={showKYC}
        onOpenChange={setShowKYC}
        currentStatus={kycStatus}
        onSubmit={updateKycStatus}
      />

      {selectedProperty && (
        <BuySharesModal
          open={showBuyModal}
          onOpenChange={setShowBuyModal}
          property={selectedProperty}
          // wallet={publicKey}
          onSharesMinted={() => setSharesRefreshKey(prev => prev + 1)}
        />
      )}
    </div>
  );
};

export default Index;
