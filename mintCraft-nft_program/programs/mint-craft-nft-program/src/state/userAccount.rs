use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct UserAccount{
    pub user:Pubkey,
    pub nft_minted:u64,
    pub bump:u8
}