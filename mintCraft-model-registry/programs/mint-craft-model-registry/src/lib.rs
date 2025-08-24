pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("W626GLKRRbE1rPZnNgi5kHgUUfFTiyzPqdvS196NdaZ");

#[program]
pub mod mint_craft_model_registry {
    use super::*;

    pub fn initializeGlobalState(ctx:Context<InitializeGlobalState>)->Result<()>{
        ctx.accounts.initialize(ctx.bumps)
    }
    pub fn initializeUser(ctx:Context<InitializeUser>)->Result<()>{
        ctx.accounts.initialize_user(ctx.bumps)
    }

    pub fn registerAiModel(ctx:Context<RegisterAiModel>,id:i64, royalty_percentage:u16, api_endpoint:String, description:String, name:String)->Result<()>{

        ctx.accounts.register_ai_model(id, royalty_percentage, api_endpoint, description, name, ctx.bumps)
    }
    pub fn dismantleAiModel(ctx:Context<DismantledAiModel>,name:String)->Result<()>{
        ctx.accounts.dismantle_ai_model(name)
    }
}
