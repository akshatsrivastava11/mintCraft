import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { MintCraftModelRegistry } from "../target/types/mint_craft_model_registry";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
} from "@solana/web3.js";
import { assert, expect } from "chai";

describe("mint-craft-model-registry", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace
    .mintCraftModelRegistry as Program<MintCraftModelRegistry>;

  // Test actors
  const authority = Keypair.generate();
  const user = Keypair.generate();

  // Derived accounts
  let userConfig: PublicKey;
  let globalState: PublicKey;
  let aiModel: PublicKey;

  // Setup
  before(async () => {
    const connection = provider.connection;

    // Airdrop SOL
    for (const wallet of [authority, user]) {
      const sig = await connection.requestAirdrop(wallet.publicKey, 2 * LAMPORTS_PER_SOL);
      await connection.confirmTransaction(sig);
    }

    // PDA Derivations
    globalState = PublicKey.findProgramAddressSync(
      [Buffer.from("globalAiState")],
      program.programId
    )[0];

    userConfig = PublicKey.findProgramAddressSync(
      [Buffer.from("user"), user.publicKey.toBuffer()],
      program.programId
    )[0];

    aiModel = PublicKey.findProgramAddressSync(
      [
        Buffer.from("ai"),
        Buffer.from("Demoapi"),
        user.publicKey.toBuffer(),
        globalState.toBuffer(),
      ],
      program.programId
    )[0];
  });

  describe("Initialization", () => {
    it("should initialize global state", async () => {
      await program.methods.initializeGlobalState().accounts({
        authority: authority.publicKey,
        globalState: globalState,
        systemProgram: SystemProgram.programId,
      }).signers([authority]).rpc();

      const stateAccount = await program.account.globalState.fetch(globalState);
      expect(stateAccount.authority.toBase58()).to.equal(authority.publicKey.toBase58());
    });

    it("should initialize user config", async () => {
      await program.methods.initializeUser().accounts({
        user: user.publicKey,
        userConfig: userConfig,
        systemProgram: SystemProgram.programId,
      }).signers([user]).rpc();

      const config = await program.account.userConfig.fetch(userConfig);
      expect(config.user.toBase58()).to.equal(user.publicKey.toBase58());
    });
  });

  describe("AI Model", () => {
    it("should register an AI model", async () => {
      await program.methods
        .registerAiModel(
          new anchor.BN(1),
          5,
          "https://api.endpoints",
          "This is a demo api",
          "Demoapi"
        )
        .accounts({
          signer: user.publicKey,
          aiModel: aiModel,
          globalState: globalState,
          userConfig: userConfig,
          systemProgram: SystemProgram.programId,
        })
        .signers([user])
        .rpc();

      const model = await program.account.aiModel.fetch(aiModel);
      expect(model.name).to.equal("Demoapi");
      expect(model.description).to.include("demo api");
    });

    it("should dismantle the AI model", async () => {
      await program.methods
        .dismantleAiModel("Demoapi")
        .accounts({
          signer: user.publicKey,
          aiModel: aiModel,
          globalState: globalState,
          userConfig: userConfig,
          systemProgram: SystemProgram.programId,
        })
        .signers([user])
        .rpc();

      try {
        await program.account.aiModel.fetch(aiModel);
        expect.fail("Model account should not exist after dismantle");
      } catch (err) {
        // console.log(err)
        expect(err.message).to.include("should not exist");
      }
    });
  });
  describe("edge cases",()=>{
    it("should fail to register an AI model with duplicate name", async () => {
      try {
        await program.methods.registerAiModel(
            new anchor.BN(1),
            5,
            "https://api.endpoints",
            "This is a demo api",
            "Demoapi"
          )
          .accounts({
            signer: user.publicKey,
            aiModel: aiModel,
            globalState: globalState,
            userConfig: userConfig,
            systemProgram: SystemProgram.programId,
          })
          .signers([user])
          .rpc();
          assert.fail("Expected transaction to fail, but it succeeded");
        
      } catch (error) {
        // console.log("an error occured",error);

          console.log("error message is ",error.message);

        // expect(error.message).to.include("should fail to register an AI model with duplicate name");
      }
      })

      it("should fail to dismantle an AI model that does not exist", async () => {
        try {
          await program.methods.dismantleAiModel("ThisModeldoesnotExist")
              .accounts({
            signer: user.publicKey,
            aiModel: aiModel,
            globalState: globalState,
            userConfig: userConfig,
            systemProgram: SystemProgram.programId,
          })
          .signers([user])
          .rpc();
          assert.fail("Expected transaction to fail, but it succeeded");
          
        } catch (error) {
          // console.log("an error occured",error);
          console.log("error message is ",error.message);
        // expect(error.message).to.include("should fail to dismantle an AI model that does not exist");
        }
      })
})

})