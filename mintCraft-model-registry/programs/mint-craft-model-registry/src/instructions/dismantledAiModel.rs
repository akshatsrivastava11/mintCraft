use std::thread::sleep;

use anchor_lang::{prelude::*};

use crate::{error::ModelRegistryError, AiModel, GlobalState, UserConfig};

#[derive(Accounts)]
#[instruction(name:String)]
pub struct DismantledAiModel<'info>{
    pub signer:Signer<'info>,
    #[account(
        mut,
        seeds=[b"ai",name.as_bytes(),signer.key().as_ref(),global_state.key().as_ref()],
        bump
    )]
    pub ai_model:Account<'info,AiModel>,
        #[account(
        seeds=[b"globalAiState"],
        bump=global_state.bump  
    )]
    pub global_state:Account<'info,GlobalState>,
        #[account(
        mut,
        seeds=[b"user",signer.key().as_ref()],
        bump
    )]
    pub user_config:Account<'info,UserConfig>,
    pub system_program:Program<'info,System>,
}

impl<'info>DismantledAiModel<'info>{
    pub fn dismantle_ai_model(&mut self,_name:String)->Result<()>{
        if self.ai_model.owner==Pubkey::default(){
            return err!(ModelRegistryError::ModelNotFound);
        }
        if self.ai_model.owner!=self.signer.key(){
            return err!(ModelRegistryError::UnauthorizedModelOwner);
        }
        
        self.ai_model.is_active=false;
        self.ai_model.Dismantled_at=Some(Clock::get()?.unix_timestamp);
        self.user_config.ai_models_registered-=1;
        Ok(())
    }
}