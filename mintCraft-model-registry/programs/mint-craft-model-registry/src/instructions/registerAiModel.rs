use anchor_lang::{prelude::*};

use crate::{AiModel, GlobalState, UserConfig};

#[derive(Accounts)]
#[instruction(id:i64,royalty_percentage:u16,api_endpoint:String,description:String,name:String,)]
pub struct RegisterAiModel<'info>{
    #[account(mut)]
    pub signer:Signer<'info>,
    #[account(
        init,
        payer=signer,
        space=8+AiModel::INIT_SPACE,
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
    pub system_program:Program<'info,System>
}

impl <'info>RegisterAiModel<'info> {
    pub fn register_ai_model(&mut self,id:i64,royalty_percentage:u16,api_endpoint:String,description:String,name:String,bumps:RegisterAiModelBumps)->Result<()>{
        // let name_bytes = name.as_bytes(); // &str is Copy so this is fine
        let name_clone=name.clone();
        self.ai_model.set_inner(AiModel { id, owner: self.signer.key(), royalty_percentage, is_active: true, created_at:Clock::get()?.unix_timestamp,Dismantled_at:None  ,api_endpoint,description,name:name,bump:bumps.ai_model});
        self.user_config.ai_models_registered+=1;
        msg!("Debug | name: {:?}", name_clone);
msg!("Debug | signer: {:?}", self.signer.key());
msg!("Debug | global_state: {:?}", self.global_state.key());

let (expected_ai_model, bump) = Pubkey::find_program_address(
    &[
        b"ai",
        name_clone.as_bytes(),
        self.signer.key().as_ref(),
        self.global_state.key().as_ref()
    ],
    &crate::ID, // or ctx.program_id
);

msg!("Debug | Expected ai_model PDA: {:?}", expected_ai_model);
msg!("Debug | Provided ai_model: {:?}", self.ai_model.key());

        Ok(())
    }
}

#[error_code]
pub enum RegistryError {
    #[msg("An AI model with this name already exists for this user.")]
    AiModelAlreadyExists,
}