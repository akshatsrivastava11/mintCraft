use anchor_lang::prelude::*;

#[error_code]
pub enum NFTProgramError {
    #[msg("Config already initialized")]
    ConfigAlreadyInitialized,
    #[msg("Config not initialized")]
    ConfigNotInitialized,
    #[msg("UserConfig not initialized")]
    UserConfigNotInitialized,
    #[msg("UserConfig already initialized")]
    UserConfigAlreadyInitialized,
    #[msg("Nft already minted")]
    NftAlreadyMinted,
    #[msg("Content Already minted")]
    ContentAlreadyMinted,
}
