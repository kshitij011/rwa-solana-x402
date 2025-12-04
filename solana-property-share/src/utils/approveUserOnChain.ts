import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import { PublicKey, Connection } from "@solana/web3.js";
import idl from "@/idl/real_estate_tokenization.json";
import { REAL_ESTATE_PROGRAM_ID } from "@/lib/constants";

export async function approveUserOnChain(walletAdapter: any, userToApprove: PublicKey) {
  if (!walletAdapter.publicKey) throw new Error("Wallet not connected");

  // 1. Connection
  const connection =
    walletAdapter.connection ??
    new Connection("https://api.devnet.solana.com");

  // 2. Construct an Anchor-compatible wallet object
  const wallet = {
    publicKey: walletAdapter.publicKey,
    signTransaction: walletAdapter.signTransaction,
    signAllTransactions: walletAdapter.signAllTransactions,
  };

  // 3. Provider
  const provider = new AnchorProvider(
    connection,
    wallet,
    AnchorProvider.defaultOptions()
  );

  // 4. Program
  const program = new Program(
    idl as any,
    // new PublicKey(REAL_ESTATE_PROGRAM_ID),
    provider
  );

  // 5. PDA for KYC entry
  const [kycEntry] = PublicKey.findProgramAddressSync(
    [Buffer.from("kyc"), userToApprove.toBuffer()],
    new PublicKey(REAL_ESTATE_PROGRAM_ID)
  );

  // 6. Call approveUser
  const txSig = await program.methods
    .approveUser()
    .accounts({
      admin: walletAdapter.publicKey,
      userToApprove,
      kycEntry,
    })
    .rpc();

  return txSig;
}
