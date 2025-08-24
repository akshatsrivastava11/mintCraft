use anchor_lang::prelude::*;
#[account]
#[derive(InitSpace)]
pub struct InitializeConfigAccount{
    pub authority:Pubkey,
    pub platform_fees:u8,
    pub bump:u8
}