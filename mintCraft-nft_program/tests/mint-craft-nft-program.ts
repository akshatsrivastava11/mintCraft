import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import { MintCraftNftProgram } from "../target/types/mint_craft_nft_program";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SYSVAR_RENT_PUBKEY,
  SystemProgram,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
} from "@solana/spl-token";

describe("mint-craft-nft-program", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.MintCraftNftProgram as Program<MintCraftNftProgram>;

  const admin = Keypair.generate();
  const user = Keypair.generate();
  let userConfig: PublicKey;
  let config: PublicKey;
  const platform_fees = 5;
  const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
  );
  let contentAccount: PublicKey;
  let nftMetadata: PublicKey;
  let mint: PublicKey;
  let metadata: PublicKey;
  let ata: PublicKey;
  const nftName = "chiiNft";
  const nftSymbol = "cnft";
  const nftUrl = "https://metadata.json";
  const id = 1;
  const prompt = "atmkbjf";
  const content_ipfs = "randomcontentipfs";
  const metadata_ipfs = "randomcontentipfs";
  let aiModel: PublicKey;
  const ai_model_royalty = 5;
  const content_type = 1;
  let bumps: any;

  before(async () => {
    // Airdrop SOL to admin and user
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(admin.publicKey, 2 * LAMPORTS_PER_SOL)
    );
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(user.publicKey, 2 * LAMPORTS_PER_SOL)
    );

    // Random AI model account
    aiModel = Keypair.generate().publicKey;

    // Derive PDAs
    config = PublicKey.findProgramAddressSync(
      [Buffer.from("config")],
      program.programId
    )[0];

    userConfig = PublicKey.findProgramAddressSync(
      [Buffer.from("user_config"), config.toBuffer(), user.publicKey.toBuffer()],
      program.programId
    )[0];

    contentAccount = PublicKey.findProgramAddressSync(
      [Buffer.from("content"), new BN(id).toArrayLike(Buffer, "le", 8)],
      program.programId
    )[0];

    nftMetadata = PublicKey.findProgramAddressSync(
      [Buffer.from("nft_metadata"), new BN(id).toArrayLike(Buffer, "le", 8)],
      program.programId
    )[0];

    mint = PublicKey.findProgramAddressSync(
      [Buffer.from("mint"), new BN(id).toArrayLike(Buffer, "le", 8)],
      program.programId
    )[0];

    // Derive metadata PDA for mpl-token-metadata
    [metadata] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    );

    // Derive ATA (will be initialized by the program)
    ata = await getAssociatedTokenAddress(mint, user.publicKey, false, TOKEN_PROGRAM_ID);
  });

  it("Initialize Config", async () => {
    await program.methods
      .initializeConfig(platform_fees)
      .accounts({
        signer: admin.publicKey,
        config: config,
        systemProgram: SystemProgram.programId,
      })
      .signers([admin])
      .rpc();
  });

  it("Initialize User", async () => {
    await program.methods
      .initializeUser()
      .accounts({
        user: user.publicKey,
        userConfig: userConfig,
        config: config,
        systemProgram: SystemProgram.programId,
      })
      .signers([user])
      .rpc();
  });

  it("Submit Content", async () => {
    await program.methods
      .submitContent(
        new BN(id),
        prompt,
        content_ipfs,
        metadata_ipfs,
        aiModel,
        ai_model_royalty,
        new BN(content_type)
      )
      .accounts({
        creator: user.publicKey,
        aiModelUsed: aiModel,
        contentAccount: contentAccount,
        systemProgram: SystemProgram.programId,
      })
      .signers([user])
      .rpc();
  });

  it("Mint Content As NFT", async () => {
    // Validate content_account state
    const contentAccountData = await program.account.contentAccount.fetch(contentAccount);
    if (!contentAccountData) {
      throw new Error("Content account not found");
    }

   

    await program.methods
      .mintContentAsNft(new BN(id), nftName, nftSymbol)
      .accounts({
        contentAccount: contentAccount,
        nftMetadata: nftMetadata,
        mint: mint,
        userConfig: userConfig,
        config: config,
        tokenAccount: ata,
        metadata: metadata,
        creator: user.publicKey,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID, // Use PublicKey
      })
      .signers([user])
      .rpc();
  });
});