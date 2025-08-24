use anchor_lang::prelude::*;

use crate::{error::MarketplaceError, Marketplace};

#[derive(Accounts)]
pub struct InitializeMarketplace<'info>{
    #[account(mut)]
    pub authority:Signer<'info>,
    #[account(
        init_if_needed,
        payer=authority,
        space=8+Marketplace::INIT_SPACE,
        seeds=[b"marketplace"],
        bump
    )]
    pub marketplace:Account<'info,Marketplace>,
    pub system_program:Program<'info,System>
}

impl <'info>InitializeMarketplace<'info> {
    pub fn initialize_marketplace(&mut self,fees:u16,bumps:InitializeMarketplaceBumps)->Result<()>{
        if self.marketplace.authority!=Pubkey::default(){
            return err!(MarketplaceError::MarketplaceAlreadyInitialized);
        }

        self.marketplace.set_inner(Marketplace {
             authority:self.authority.key(),
              total_listing:0,
               total_sales: 0,
                platform_fees_percent:fees,
                 bump: bumps.marketplace
                 });
                 Ok(())
    }
}