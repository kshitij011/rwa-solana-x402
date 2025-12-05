import express from "express";
import cors from "cors";
import { X402PaymentHandler } from "x402-solana/server";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const FRONTEND_ORIGIN = "https://rwa-solana-x402.vercel.app";


// ------------------------------------
// GLOBAL CORS CONFIGURATION (Updated for stricter preflight compliance)
// Changed allowedHeaders to '*' and added maxAge for caching preflight results.
// ------------------------------------
app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: "*", // Use wildcard to ensure all custom headers pass preflight
    credentials: false,
    maxAge: 86400 // Cache preflight response for 24 hours
  })
);

// The global app.use(cors) handles OPTIONS requests automatically.
app.use(express.json());

// ------------------------------------
const USDC_DEVNET = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";

const x402 = new X402PaymentHandler({
  network: "solana-devnet",
  facilitatorUrl: "https://facilitator.payai.network",
  treasuryAddress: process.env.TREASURY_WALLET_ADDRESS || "",
});

// ------------------------------------
app.post("/api/paid-endpoint", async (req, res) => {
  const paymentHeader = x402.extractPayment(req.headers);

  const totalCost = req.headers["x-total-cost"];
  if (!totalCost)
    return res.status(400).json({ error: "Missing x-total-cost header" });

  const microUsdc = String(Math.round(Number(totalCost) * 1_000_000));

  const paymentRequirements = await x402.createPaymentRequirements({
    price: {
      amount: microUsdc,
      asset: { address: USDC_DEVNET, decimals: 6 },
    },
    network: "solana-devnet",
    config: {
      description: `Purchase of ${req.body.quantity} shares`,
      resource: "https://rwa-solana-x402.onrender.com/api/paid-endpoint",
      discoverable: false,
    },
  });

  // ------------------------------
  // 402 PAYMENT REQUIRED
  // ------------------------------
  if (!paymentHeader) {
    const resp = x402.create402Response(paymentRequirements);

    // Global CORS middleware handles headers here.
    return res.status(resp.status).json(resp.body);
  }

  // ------------------------------
  // VERIFY PAYMENT
  // ------------------------------
  const verified = await x402.verifyPayment(paymentHeader, paymentRequirements);

  if (!verified) {
    return res.status(402).json({ error: "Invalid payment" });
  }

  const tx = await x402.settlePayment(paymentHeader, paymentRequirements);

  return res.json({
    ok: true,
    txHash: tx.transaction,
    amount: totalCost,
    msg: "Payment success",
  });
});

// ------------------------------------
app.listen(4000, () => {
  console.log("Backend running on port 4000");
});