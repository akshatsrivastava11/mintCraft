use anchor_lang::prelude::*;

use crate::{error::MarketplaceError, UserConfig};

#[derive(Accounts)]
pub struct InitializeUser<'info>{
    #[account(mut)]
    pub user:Signer<'info>,
    #[account(
        init_if_needed,
        payer=user,
        space=8+UserConfig::INIT_SPACE,
        seeds=[b"user",user.key().as_ref()],
        bump
    )]
    pub user_config:Account<'info,UserConfig>,
    pub system_program:Program<'info,System>
}
impl<'info>InitializeUser<'info>{
    pub fn initialize_user(&mut self,bumps:InitializeUserBumps)->Result<()>{
        if self.user_config.user!=Pubkey::default(){
            return err!(MarketplaceError::UserConfigAlreadyInitialized);
        }
        self.user_config.set_inner(UserConfig { 
            user: self.user.key(),
             total_listed: 0,
              total_buyed:0,
              bump:bumps.user_config
             });
             Ok(())
    }
}