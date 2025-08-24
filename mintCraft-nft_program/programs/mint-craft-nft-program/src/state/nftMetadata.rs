use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct NftMetadata{
    pub owner:Pubkey,
    pub content_id:Pubkey,
    pub mint:Pubkey,
    #[max_len(50)]
    pub name:String,
    #[max_len(10)]
    pub symbol:String,
    #[max_len(100)]
    pub metadata_uri:String,
    pub ai_model_used:Pubkey,
    pub creator_royalty:u16,
    pub is_mutable:bool,
    pub verified:bool,
    pub minted_at:i64
}