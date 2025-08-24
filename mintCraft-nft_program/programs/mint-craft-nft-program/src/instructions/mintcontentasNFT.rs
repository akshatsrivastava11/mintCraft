
use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken, 
    metadata::{
        create_metadata_accounts_v3, 
        mpl_token_metadata::{self, types::DataV2}, 
        CreateMetadataAccountsV3, Metadata
    }, 
    token::{mint_to, Mint, MintTo, Token, TokenAccount}, token_interface::spl_token_metadata_interface::state::TokenMetadata
};

use crate::{error::NFTProgramError, ContentAccount, InitializeConfigAccount, NftMetadata, UserAccount};

#[derive(Accounts)]
#[instruction(content_id: u64, nft_name: String, nft_symbol: String)]
pub struct MintContentAsNFT<'info> {
    #[account(
        mut,
        has_one = creator,
        seeds = [b"content", content_id.to_le_bytes().as_ref()],
        bump
    )]
    pub content_account: Account<'info, ContentAccount>,
    #[account(
        init,
        payer = creator,
        space = 8 + NftMetadata::INIT_SPACE,
        seeds = [b"nft_metadata", content_id.to_le_bytes().as_ref()],
        bump
    )]
    pub nft_metadata: Account<'info, NftMetadata>,
    #[account(
        init,
        payer = creator,
        seeds = [b"mint", content_id.to_le_bytes().as_ref()],
        bump,
        mint::authority = user_config,
        mint::decimals = 0,
        mint::freeze_authority = config
    )]
    // FIX 1: Use `Mint` directly, not `anchor_spl::token::Mint`.
    pub mint: Account<'info, Mint>,
    #[account(
        seeds = [b"user_config", config.key().as_ref(), creator.key().as_ref()],
        bump
    )]
    pub user_config: Account<'info, UserAccount>,
    #[account(
        seeds = [b"config".as_ref()],
        bump
    )]
    pub config: Account<'info, InitializeConfigAccount>,
    #[account(
        init,
        payer = creator,
        associated_token::mint = mint,
        associated_token::authority = creator
    )]
    // FIX 2: Use `TokenAccount` directly, not `anchor_spl::token::TokenAccount`.
    pub token_account: Account<'info, TokenAccount>,
    
    // FIX 3: Use a documentation comment `///` for the safety check.
    /// CHECK: This account is created and validated by the token-metadata program in the CPI.
    #[account(mut)]
    pub metadata: UncheckedAccount<'info>,
    
    #[account(mut)]
    pub creator: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    
    /// CHECK: This is the official token metadata program address.
    pub token_metadata_program: Program<'info,Metadata>,
}

impl<'info> MintContentAsNFT<'info> {
    pub fn mint_content_as_nft(&mut self, _content_id: u64, nft_name: String, nft_symbol: String, _bumps: MintContentAsNFTBumps) -> Result<()> {
        // Minting the NFT to the user's ATA
        if self.nft_metadata.owner!=Pubkey::default(){
            return err!(NFTProgramError::NftAlreadyMinted);
        }
        let config_key = self.config.key();
        let creator_key = self.creator.key();
        
        let seeds = &[
            b"user_config".as_ref(),
            config_key.as_ref(),
            creator_key.as_ref(),
            &[self.user_config.bump],
        ];
        let signer_seeds = &[&seeds[..]];

        // Mint one token to the associated token account
        mint_to(
            CpiContext::new_with_signer(
                self.token_program.to_account_info(),
                MintTo {
                    mint: self.mint.to_account_info(),
                    to: self.token_account.to_account_info(),
                    authority: self.user_config.to_account_info(),
                },
                signer_seeds,
            ),
            1,
        )?;
        msg!("controll reached making of DATAV2");

        // Create the metadata account for the NFT
        let data_v2 = DataV2 {
            name: nft_name.clone(),
            symbol: nft_symbol.clone(),
            uri: self.content_account.metadata_ipfs.clone(),
            seller_fee_basis_points: self.content_account.ai_model_royalty,
            creators: Some(vec![
                mpl_token_metadata::types::Creator {
                    address: self.content_account.creator,
                    verified: false, // The creator is verified as it's part of the account
                    share: 100,
                },
            ]),
            collection: None, 
            uses: None,
        };
        msg!("controll reached making of createmetadataacc");

        create_metadata_accounts_v3(
            CpiContext::new_with_signer(
                self.token_metadata_program.to_account_info(),
                CreateMetadataAccountsV3 {
                    metadata: self.metadata.to_account_info(),
                    mint: self.mint.to_account_info(),
                    mint_authority: self.user_config.to_account_info(),
                    payer: self.creator.to_account_info(),
                    update_authority: self.user_config.to_account_info(), // Set creator as update authority
                    system_program: self.system_program.to_account_info(),
                    rent: self.rent.to_account_info(),
            
                },
                signer_seeds,
            ),
            data_v2,
            false, // is_mutable
            true,  // update_authority_is_signer
            None,  // collection_details
        )?;

        // Update your program's state
        self.content_account.is_minted = true;
        self.content_account.mint = Some(self.mint.key());
        self.content_account.mint_address_ata=Some(self.token_account.key());
        
        self.nft_metadata.set_inner(NftMetadata {
            content_id: self.content_account.key(),
            mint: self.mint.key(),
            name: nft_name,
            symbol: nft_symbol,
            metadata_uri: self.content_account.metadata_ipfs.clone(),
            ai_model_used: self.content_account.ai_model_used.clone(),
            creator_royalty: self.content_account.ai_model_royalty,
            is_mutable: true,
            verified: false,
            minted_at: Clock::get()?.unix_timestamp,
            owner: self.creator.key(),
        });

        Ok(())
    }
}