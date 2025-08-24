use anchor_lang::prelude::*;

#[error_code]
pub enum MarketplaceError {
    #[msg("Marketplace already initialized")]
    MarketplaceAlreadyInitialized,
    #[msg("User config already initialized")]
    UserConfigAlreadyInitialized,
    #[msg("Listing Not present")]
    ListingNotFound,
    #[msg("User Config not present")]
    UserConfigNotFound,
    #[msg("Listing already exists")]
    ListingAlreadyExists

}
