use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct GlobalState{
    pub authority:Pubkey,
    pub total_models:u64,
    pub platform_total_fees:u64,
    pub bump:u8
}
