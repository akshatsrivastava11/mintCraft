import {create} from 'zustand'
import { trpc } from '@/app/clients/trpc';
import { PublicKey,VersionedTransaction,SendTransactionError } from '@solana/web3.js'
import {
  WalletSendTransactionError,
  
    type SignerWalletAdapterProps,
    type WalletAdapterProps,
   
} from '@solana/wallet-adapter-base';
import {Transaction,Connection} from '@solana/web3.js'
// import { useConnection } from '@solana/wallet-adapter-react';
const MINT_CRAFT_MODEL_REGISTRY_PROGRAM_ADDRESS="W626GLKRRbE1rPZnNgi5kHgUUfFTiyzPqdvS196NdaZ"
// const connection=useConnection()
const useAppstore=create((set,get)=>({
    wallet:{
        isConnected:false,
        address:PublicKey,
        balance:0
    },
    //Ai-models
    aiModels:{
        available:[],
        isLoading:false,
        selectedModel:null
    },
    loadAvailableModels:async ()=>{},
 
    //content-type
    createContent:async ()=>{},
    loadUserContent:async ()=>{},
    //nft
    nft:{},
    mintNft:async()=>{},
    loadUserNfts:async()=>{},
    marketplace:{},
    loadMarktetplaceListings:async()=>{},
    createListings:async()=>{},
    buyNft:async()=>{},
    loadUserListings:async()=>{},
signingTransaction: async (
  signTransaction: SignerWalletAdapterProps['signTransaction'] | undefined,
  sendTransaction: WalletAdapterProps['sendTransaction'],
  connection: ConnectionContextState,
  TransactionSig: string,
  wallet:string
) => {
  try {
    const txBuffer = Buffer.from(TransactionSig, 'base64')
    const transaction = VersionedTransaction.deserialize(txBuffer)
    transaction.message.recentBlockhash = await (await connection.connection.getLatestBlockhash()).blockhash
const config=await PublicKey.findProgramAddressSync(
     [Buffer.from("config")],
     new PublicKey("FqDJgJMNxGqpR8p3A7mtp4Cyow2DiXrXFoGCL1RXYsvU")
 )
 const connectionnew = new Connection("https://api.devnet.solana.com");

 // ✅ Derive user_config PDA
 const [userConfigPda] = PublicKey.findProgramAddressSync(
     [Buffer.from("user_config"), config[0].toBuffer(),new PublicKey(wallet).toBuffer()],
     new PublicKey("FqDJgJMNxGqpR8p3A7mtp4Cyow2DiXrXFoGCL1RXYsvU") // replace with your actual programId
 );
 console.log("userconfigdpa is ",userConfigPda)

 // ✅ Check if the PDA exists
 const accountInfo = await connectionnew.getAccountInfo(userConfigPda, {
     commitment: "confirmed",
 });
 console.log("accountinfo is ",accountInfo)
    if (signTransaction) {

        // transaction.
      transaction.message.recentBlockhash=(await connection.connection.getLatestBlockhash()).blockhash
      const signedTx = await signTransaction(transaction)
      
      console.log("signedTx is  ",signedTx)
      // signedTx.message.recentBlockhash=(await connection.connection.getLatestBlockhash()).blockhash
      // signedTx.message.recentBlockhash=(await connection.connection.getLatestBlockhash()).blockhash
      const sig = await connection.connection.sendRawTransaction(signedTx.serialize())
      console.log("Submitted tx signature:", sig)
      await connection.connection.confirmTransaction(sig, 'processed')
    return sig
    }
  } catch (err) {
if(err instanceof SendTransactionError){
            console.log("send transaction errors :", (await err.getLogs(new Connection("https://api.devnet.solana.com"))));

            console.log("send transaction errors :", (await err.getLogs(new Connection("https://api.devnet.solana.com")))[6]);
            console.log("send transaction errors :", (await err.getLogs(new Connection("https://api.devnet.solana.com")))[8]);

        }
  console.error("Signing or sending transaction failed:", err);
  }
}

}))

export default useAppstore;

export interface ConnectionContextState {
    connection: Connection;
}