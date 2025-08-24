use anchor_lang::prelude::*;



#[account]
#[derive(InitSpace)]
pub struct UserConfig{
    pub user:Pubkey,
    pub ai_models_registered:u64,
    pub bump:u8
}