use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct ContentAccount{
    pub id:u64,
    pub creator:Pubkey,
    #[max_len(500)]
    pub prompt:String,
    #[max_len(50)]
    pub content_ipfs:String,
    #[max_len(50)]
    pub metadata_ipfs:String,
    pub ai_model_used:Pubkey,
    pub ai_model_royalty:u16,
    pub generation_timeStamp:i64,
    pub mint:Option<Pubkey>,
    pub content_type:i64,//1=music 2=image 3//Text
    pub is_minted:bool,
    pub mint_address_ata:Option<Pubkey>,
}