use anchor_lang::prelude::*;

#[error_code]
pub enum ModelRegistryError {

    //GlobalState
    #[msg("Global State Already Initialized")]
    AlreadyInitializedGlobalState,
    #[msg("Global state not yet initialized.")]
    GlobalStateNotInitialized,
    // User
    #[msg("User already initialized.")]
    UserAlreadyInitialized,
    #[msg("User not initialized.")]
    UserNotInitialized,
    // Model
    #[msg("AI model already registered.")]
    ModelAlreadyRegistered,
    #[msg("AI model not found.")]
    ModelNotFound,
    #[msg("You are not the owner of this AI model.")]
    UnauthorizedModelOwner,
    #[msg("Model dismantle not allowed. Check conditions.")]
    ModelDismantleNotAllowed,

}
