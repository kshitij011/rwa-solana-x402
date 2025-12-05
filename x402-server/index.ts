import express from "express";
import cors from "cors";
import { X402PaymentHandler } from "x402-solana/server";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const FRONTEND_ORIGIN = "https://rwa-solana-x402.vercel.app";


// ------------------------------------
// GLOBAL CORS CONFIGURATION
// Ensure this middleware runs for ALL requests, including OPTIONS.
// ------------------------------------
app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "x-total-cost",
      "x-property-id",
      "x-quantity",
      "x-payment",
      "authorization",
    ],
    // IMPORTANT: Credentials must be true if the frontend requires them, but since you set it to false, we keep it.
    credentials: false,
  })
);

// Note: The global app.use(cors) handles OPTIONS requests automatically,
// so the explicit app.options("*", cors()) call is redundant but harmless.
// app.options("*", cors());

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

    // --- REMOVED MANUAL HEADER SETTING ---
    // The global CORS middleware handles setting the 'Access-Control-Allow-Origin'
    // and other necessary headers for both successful and 402 responses.

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