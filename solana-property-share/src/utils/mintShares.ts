import * as anchor from "@coral-xyz/anchor";
import { AnchorProvider, Program, BN } from "@coral-xyz/anchor";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction
} from "@solana/spl-token";

import idl from "../idl/real_estate_tokenization.json";


export async function mintShares({
  wallet,
  propertyId,
  quantity,
}: {
  wallet: any;
  propertyId: number;
  quantity: number;
}) {
  try {
    if (!wallet?.publicKey) {
      throw new Error("Wallet not connected");
    }

    const connection = new Connection("https://api.devnet.solana.com");

    const provider = new AnchorProvider(
      connection,
      wallet,
      AnchorProvider.defaultOptions()
    );

    const program = new Program(
      idl as any,
      provider
    );

    // ----------------------------
    // Derive PDAs
    // ----------------------------

    const [propertyConfig] = PublicKey.findProgramAddressSync(
      [Buffer.from("config"), new BN(propertyId).toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    const [mint] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("property_mint"),
        new BN(propertyId).toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

    const userPk = wallet.publicKey;
    const ata = await getAssociatedTokenAddress(mint, userPk);

    // ----------------------------
    // Create ATA If Missing
    // ----------------------------
    const ataInfo = await connection.getAccountInfo(ata);

    if (!ataInfo) {
      const tx = new Transaction().add(
        createAssociatedTokenAccountInstruction(
          userPk,
          ata,
          userPk,
          mint
        )
      );
      await provider.sendAndConfirm(tx);
    }

    // ----------------------------
    // BUY SHARES ON-CHAIN
    // PDA signs for minting.
    // ----------------------------

    const tx = await program.methods
      .buyShares(new BN(propertyId), new BN(quantity))
      .accounts({
        buyer: userPk,
        receiver: userPk,
        propertyConfig,
        mint,
        receiverAta: ata,
      })
      .rpc();

    return tx; // return signature
  } catch (err: any) {
    console.error("Mint error:", err);
    throw err;
  }
}
