import express from "express";
import cors from "cors";
import { X402PaymentHandler } from "x402-solana/server";
import dotenv from "dotenv";
dotenv.config();

const app = express();

// ------------------ SECURE CORS ------------------
app.use(
  cors({
    origin: [
      "https://rwa-solana-x402.vercel.app",
    ],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "x-total-cost",
      "x-property-id",
      "x-quantity",
      "x-payment",
      "authorization",
    ],
  })
);

app.options("*", cors());

app.use(express.json());

// IMPORTANT: devnet USDC mint
const USDC_DEVNET = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";

const x402 = new X402PaymentHandler({
  network: "solana-devnet",
  facilitatorUrl: "https://facilitator.payai.network",
  treasuryAddress: process.env.TREASURY_WALLET_ADDRESS
    ? process.env.TREASURY_WALLET_ADDRESS
    : "",
});

app.options("/api/paid-endpoint", cors());

// ----------------------------------
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

  if (!paymentHeader) {
    const response = x402.create402Response(paymentRequirements);

    res.setHeader("Access-Control-Allow-Origin", "https://rwa-solana-x402.vercel.app");
  res.setHeader("Access-Control-Allow-Headers", "*");

    return res.status(response.status).json(response.body);
  }

  const verified = await x402.verifyPayment(paymentHeader, paymentRequirements);

  if (!verified) {
    return res.status(402).json({ error: "Invalid payment" });
  }

  const tx = await x402.settlePayment(paymentHeader, paymentRequirements);
  console.log(`Payment settled successfully for Tx: ${tx}`);
  const txHash = tx.transaction;

  return res.json({
    ok: true,
    txHash,
    amount: totalCost,
    msg: "Payment success",
  });
});

// ----------------------------------
app.listen(4000, () => {
  console.log("Backend running on port 4000");
});
