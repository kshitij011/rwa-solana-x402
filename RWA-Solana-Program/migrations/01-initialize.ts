import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import { BN } from "bn.js";
import fs from "fs";

const PROGRAM_ID = new PublicKey("2SLgYEkzcZfHeZqhssWJSxC4w8pyLheFjj275z1QtYXY");

// ----------- ADMIN WALLET ----------
const ADMIN_KEYPAIR_PATH = "/Users/kshitij/.config/solana/id.json";

function loadKeypair(path: string): Keypair {
  const secret = JSON.parse(fs.readFileSync(path, "utf8"));
  return Keypair.fromSecretKey(new Uint8Array(secret));
}

const admin = loadKeypair(ADMIN_KEYPAIR_PATH);

// ----------- DERIVE PDAs -----------
function derivePDAs(propertyId: number) {
  const idBN = new BN(propertyId);
  const idBuf = idBN.toArrayLike(Buffer, "le", 8);

  const config = PublicKey.findProgramAddressSync(
    [Buffer.from("config"), idBuf],
    PROGRAM_ID
  )[0];

  const mint = PublicKey.findProgramAddressSync(
    [Buffer.from("property_mint"), idBuf],
    PROGRAM_ID
  )[0];

  const treasury = PublicKey.findProgramAddressSync(
    [Buffer.from("treasury")],
    PROGRAM_ID
  )[0];

  return { config, mint, treasury };
}

// ----------- PROPERTIES TO INITIALIZE -----------
const PROPERTIES = [
  { id: 1, pricePerShare: 100, maxShares: 1000 },
  { id: 2, pricePerShare: 200, maxShares: 500 },
  { id: 3, pricePerShare: 50, maxShares: 5 },
];

async function main() {
  // Set provider
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const idl = JSON.parse(
  fs.readFileSync("./target/idl/real_estate_tokenization.json", "utf8")
);

const program = new anchor.Program(idl, provider);


  console.log("Admin:", admin.publicKey.toBase58());
  console.log("Program:", PROGRAM_ID.toBase58());

  for (const prop of PROPERTIES) {
    console.log(`\n⏳ Initializing Property ${prop.id} ...`);
    const { config, mint, treasury } = derivePDAs(prop.id);

    try {
      const tx = await program.methods
        .initializeProperty(
          new BN(prop.id),
          new BN(prop.pricePerShare),
          new BN(prop.maxShares)
        )
        .accounts({
          admin: admin.publicKey,
          propertyConfig: config,
          mint,
          treasury,
          tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([admin])
        .rpc();

      console.log(`✅ Property ${prop.id} initialized successfully!`);
      console.log("Tx:", tx);
      console.log("Config PDA:", config.toBase58());
      console.log("Mint PDA:", mint.toBase58());

    } catch (err) {
      console.log(`⚠️ Property ${prop.id} initialization failed`);
      console.log(err);
    }
  }

  console.log("\n🎉 Initialization script completed.");
}

main().catch(console.error);
