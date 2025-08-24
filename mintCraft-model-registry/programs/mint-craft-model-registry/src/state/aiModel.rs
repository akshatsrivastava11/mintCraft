use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct AiModel{
    pub id:i64,
    pub owner:Pubkey,
    #[max_len(50)]
    pub name:String,
    #[max_len(100)]
    pub description:String,
    pub royalty_percentage:u16,
    pub is_active:bool,
    pub created_at:i64,
    #[max_len(50)]
    pub api_endpoint:String,
    pub Dismantled_at:Option<i64>,
    pub bump:u8
}

