use anchor_lang::prelude::*;

use crate::{userAccount::UserAccount, InitializeConfigAccount};


#[derive(Accounts)]
pub struct InitializeUser<'info>{
    #[account(mut)]
    pub user:Signer<'info>,
    #[account(
        init,
        payer=user,
        space=8+UserAccount::INIT_SPACE,
        seeds=[b"user_config",config.key().as_ref(),user.key().as_ref()],
        bump
    )]
    pub user_config:Account<'info,UserAccount>,
    #[account(
        seeds=[b"config".as_ref()],
        bump=config.bump
    )]
    pub config:Account<'info,InitializeConfigAccount>,
    pub system_program:Program<'info,System>,
    
}

impl<'info>InitializeUser<'info>{
    pub fn InitializeUser(&mut self,bumps:InitializeUserBumps)->Result<()>{
        self.user_config.set_inner(UserAccount{
        bump:bumps.user_config,
        nft_minted:0,
        user:self.user.key()
        });
        Ok(())
    }
}