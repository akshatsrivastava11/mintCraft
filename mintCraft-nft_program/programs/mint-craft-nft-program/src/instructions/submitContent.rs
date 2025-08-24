use anchor_lang::prelude::{self, *};

use crate::{error::NFTProgramError, ContentAccount};

#[derive(Accounts)]
#[instruction(id:u64)]
pub struct SubmitContent<'info>{
    #[account(mut)]
    pub creator:Signer<'info>,
    #[account(
        init,
        payer=creator,
        space=8+ContentAccount::INIT_SPACE,
        seeds = [b"content", id.to_le_bytes().as_ref()],
        bump
    )]
    pub content_account:Account<'info,ContentAccount>,
    ///CHECK: this is not dangerous because we don't read or write from this account
    pub aiModelUsed:AccountInfo<'info>,
    pub system_program:Program<'info,System>
}
impl<'info>SubmitContent<'info>{
    pub fn submit_content(&mut self,id:u64,prompt:String,content_ipfs:String,metadata_ipfs:String,ai_model_used:Pubkey,ai_model_royalty:u16,content_type:i64)->Result<()>{
        if self.content_account.creator!=Pubkey::default(){
            return err!(NFTProgramError::ContentAlreadyMinted);
        }
        self.content_account.set_inner(ContentAccount { 
            id:id,
             creator:self.creator.key(),
              prompt,
               content_ipfs,
                metadata_ipfs,
                 ai_model_used,
                  ai_model_royalty,
                   generation_timeStamp:Clock::get()?.epoch_start_timestamp,
                     content_type,
                       mint_address_ata:None,
                        is_minted:false,
                        mint:None
                         });
        Ok(())
    }
}