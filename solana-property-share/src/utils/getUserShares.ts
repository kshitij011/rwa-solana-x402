import { PublicKey } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { getAssociatedTokenAddress, getAccount } from "@solana/spl-token";
import idl from "@/idl/real_estate_tokenization.json";

export async function getUserShares(
  provider: anchor.AnchorProvider,
  wallet: PublicKey,
  propertyId: number
) {
  const program = new anchor.Program(idl as anchor.Idl, provider);

  // 1. Derive the mint PDA
  const [mintPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("property_mint"),
      new anchor.BN(propertyId).toArrayLike(Buffer, "le", 8),
    ],
    new PublicKey(idl.address)
  );

  // 2. Derive the user's ATA (Associated Token Account)
  const ata = await getAssociatedTokenAddress(mintPda, wallet);

  try {
    // 3. Read SPL token account balance
    const accountInfo = await getAccount(provider.connection, ata);
    return Number(accountInfo.amount);
  } catch (err) {
    console.log("User doesn't own tokens yet", err)
    return 0;
  }
}
