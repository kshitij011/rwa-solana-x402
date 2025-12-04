// Hardcoded Solana addresses for tokenized properties
// These would be generated after deploying the Solana program

import { Property } from "./types";

export const PROPERTY_CONFIGS = {
  baliVilla: {
    configPDA: "BaLi1ViLLa...EXAMPLE_CONFIG_PDA",
    mintPDA: "BaLi1ViLLa...EXAMPLE_MINT_PDA",
    treasuryPDA: "BaLi1ViLLa...EXAMPLE_TREASURY_PDA",
  },
  miamiPenthouse: {
    configPDA: "MiAmI1PeNt...EXAMPLE_CONFIG_PDA",
    mintPDA: "MiAmI1PeNt...EXAMPLE_MINT_PDA",
    treasuryPDA: "MiAmI1PeNt...EXAMPLE_TREASURY_PDA",
  },
  dubaiApartment: {
    configPDA: "DuBaI1ApT...EXAMPLE_CONFIG_PDA",
    mintPDA: "DuBaI1ApT...EXAMPLE_MINT_PDA",
    treasuryPDA: "DuBaI1ApT...EXAMPLE_TREASURY_PDA",
  },
};

export const PROPERTIES: Property[] = [
  {
    id: "1",
    name: "Bali Oceanfront Villa",
    location: "Uluwatu, Bali, Indonesia",
    description: "Luxurious 5-bedroom oceanfront villa with infinity pool, private beach access, and panoramic sunset views. Prime rental income potential in Bali's most sought-after location.",
    pricePerShare: 0.1,
    totalShares: 1000,
    sharesSold: 547,
    minInvestment: 1,
    maxInvestment: 100,
    propertyValue: 1200000,
    projectedYield: 8.5,
    images: [
      "https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?w=800&q=80",
    ],
    amenities: ["Infinity Pool", "Private Beach", "5 Bedrooms", "Smart Home", "Ocean View", "Staff Quarters"],
    documents: [
      { name: "Property Deed", verified: true },
      { name: "Valuation Report", verified: true },
      { name: "Legal Opinion", verified: true },
    ],
  },
  {
    id: "2",
    name: "Miami Beach Penthouse",
    location: "South Beach, Miami, USA",
    description: "Stunning 4-bedroom penthouse with 360° ocean and city views. Located in the heart of South Beach with world-class amenities and direct beach access.",
    pricePerShare: 0.25,
    totalShares: 800,
    sharesSold: 312,
    minInvestment: 1,
    maxInvestment: 50,
    propertyValue: 2500000,
    projectedYield: 6.8,
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
    ],
    amenities: ["Rooftop Terrace", "Private Elevator", "4 Bedrooms", "Concierge", "Ocean View", "Gym"],
    documents: [
      { name: "Property Deed", verified: true },
      { name: "Valuation Report", verified: true },
      { name: "Legal Opinion", verified: true },
    ],
  },
  {
    id: "3",
    name: "Dubai Marina Luxury Apt",
    location: "Dubai Marina, UAE",
    description: "Premium 3-bedroom apartment in iconic Dubai Marina tower. Floor-to-ceiling windows with breathtaking marina views, high rental demand from executives.",
    pricePerShare: 0.15,
    totalShares: 600,
    sharesSold: 489,
    minInvestment: 1,
    maxInvestment: 75,
    propertyValue: 950000,
    projectedYield: 9.2,
    images: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80",
    ],
    amenities: ["Marina View", "Pool", "3 Bedrooms", "Smart Home", "Gym", "Valet Parking"],
    documents: [
      { name: "Property Deed", verified: true },
      { name: "Valuation Report", verified: true },
      { name: "Legal Opinion", verified: true },
    ],
  },
];

// USDC on Solana Mainnet
export const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

export const REAL_ESTATE_PROGRAM_ID="2SLgYEkzcZfHeZqhssWJSxC4w8pyLheFjj275z1QtYXY";

// Network configuration
export const SOLANA_NETWORK = "mainnet-beta";
export const RPC_ENDPOINT = "https://api.mainnet-beta.solana.com";
