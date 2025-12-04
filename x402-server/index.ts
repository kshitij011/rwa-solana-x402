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
      "http://localhost:5173",            // local frontend for dev
      "https://your-frontend-domain.com", // your production frontend
    ],
    methods: ["POST"],
  })
);

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
      resource: "http://localhost:4000/api/paid-endpoint",
      discoverable: false,
    },
  });

  if (!paymentHeader) {
    const response = x402.create402Response(paymentRequirements);
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
