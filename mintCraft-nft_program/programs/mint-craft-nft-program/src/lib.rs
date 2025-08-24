pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("FqDJgJMNxGqpR8p3A7mtp4Cyow2DiXrXFoGCL1RXYsvU");

#[program]
pub mod mint_craft_nft_program {
    use super::*;
    pub fn initialize_config(ctx:Context<InitializeConfig>,platform_fees:u8)->Result<()>{
        ctx.accounts.initialize_config(platform_fees, ctx.bumps)
    }
    pub fn initialize_user(ctx:Context<InitializeUser>)->Result<()>{
        ctx.accounts.InitializeUser(ctx.bumps)
    }
    pub fn submit_content(ctx:Context<SubmitContent>,id:u64,prompt:String,content_ipfs:String,metadata_ipfs:String,ai_model_used:Pubkey,ai_model_royalty:u16,content_type:i64)->Result<()>{
        ctx.accounts.submit_content(id, prompt, content_ipfs, metadata_ipfs, ai_model_used, ai_model_royalty, content_type)
    }
    pub fn mint_content_as_nft(ctx:Context<MintContentAsNFT>,content_id:u64, nft_name:String, nft_symbol:String)->Result<()>{
        ctx.accounts.mint_content_as_nft(content_id, nft_name, nft_symbol, ctx.bumps)
    }
}
