use crate::*;
use std::borrow::{BorrowMut};

#[derive(AnchorSerialize, AnchorDeserialize, Default, Clone, Debug, PartialEq)]
pub enum ActionType {
    #[default]
    Depositing,
    Fulfilling
}

#[derive(AnchorSerialize, AnchorDeserialize, Default, Clone, Debug, PartialEq)]
pub struct TransferAssetsToVaultParams {
    pub swap_token_vault_bump: u8,
    pub proposal_id: String,
    pub action_type: ActionType,
    pub option_id: String,
    pub swap_item_id: String,
}

#[derive(Accounts)]
#[instruction(params: TransferAssetsToVaultParams)]
pub struct TransferAssetsToVaultContext<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    pub mint_account: Account<'info, Mint>,

    #[account(mut)]
    /// CHECK: the signer token account can be verified later
    pub signer_token_account: AccountInfo<'info>,

    #[account(
        mut,
        seeds = [PROPOSAL_SEED, params.proposal_id.as_bytes().as_ref()],
        bump = swap_proposal.bump,
    )]
    pub swap_proposal: Account<'info, SwapProposal>,

    #[account(
        mut,
        seeds = [TOKEN_ACCOUNT_SEED, mint_account.key().as_ref()],
        bump = params.swap_token_vault_bump
    )]
    pub swap_token_vault: Account<'info, TokenAccount>,

    #[account(address = system_program::ID)]
    pub system_program: Program<'info, System>,

    #[account(address = spl_token::ID)]
    pub token_program: Program<'info, Token>,
}

impl<'info> TransferAssetsToVaultContext<'info> {
    pub fn execute(&mut self, params: TransferAssetsToVaultParams) -> Result<()> {
        // Check and route for depositing
        if params.action_type == ActionType::Depositing {
            return self.deposit(params);
        }

        // Check and route for fulfilling
        if params.action_type == ActionType::Fulfilling {
            return self.fulfill(params);
        }

        return Err(SwapError::InvalidValue.into());
    }

    fn deposit(&mut self, params: TransferAssetsToVaultParams) -> Result<()> {
        let swap_proposal = self.swap_proposal.borrow_mut();
        let swap_proposal_key = swap_proposal.key().clone();

        // check whether the proposal is still open for depositing
        if !swap_proposal.is_proposal_open_for_depositing() {
            return Err(SwapError::DepositIsNotAvailable.into());
        }

        // find the swap item
        let item = swap_proposal.offered_items
            .iter_mut()
            .find(|x| x.id == params.swap_item_id)
            .unwrap();

        // Raise error
        if item.status != SwapItemStatus::Created {
            return Err(SwapError::DepositIsNotAvailable.into());
        }

        // transfer the token
        token::transfer(
            CpiContext::new(
                self.token_program.to_account_info(),
                Transfer {
                    from: self.signer_token_account.to_account_info(),
                    to: self.swap_token_vault.to_account_info(),
                    authority: self.signer.to_account_info(),
                },
            ),
            item.amount,
        ).unwrap();

        // update the item status
        item.status = SwapItemStatus::Deposited;
        item.owner = self.signer.key().clone();

        swap_emit!(
            ItemDeposited {
                id: item.id.clone(),
                status: SwapItemStatus::Deposited,
                proposal_key: swap_proposal_key,
                actor: self.signer.key().clone(),
            }
        );

        // update the proposal status if applicable
        if (swap_proposal.offered_items
            .iter()
            .filter(|&x| x.status == SwapItemStatus::Deposited)
            .count()
        ) == swap_proposal.offered_items.len() {
            swap_proposal.status = SwapProposalStatus::Deposited;

            // emit event
            swap_emit!(
                ProposalDeposited {
                    status: SwapProposalStatus::Deposited,
                    actor: self.signer.key().clone(),
                    proposal_key: swap_proposal_key,
                    id: swap_proposal.id.clone()
                }
            );
        }

        return Ok(());
    }

    fn fulfill(&mut self, params: TransferAssetsToVaultParams) -> Result<()> {
        let current_params = params.clone();
        let swap_proposal = self.swap_proposal.borrow_mut();
        let swap_proposal_key = swap_proposal.key().clone();

        // check whether the proposal is still open for depositing
        if !swap_proposal.is_proposal_open_for_fulfilling(
            params.option_id.clone(),
            self.signer.key().clone()
        ) {
            return Err(SwapError::FulfillingIsNotAvailable.into());
        }

        // first reserve the proposal
        swap_proposal.fulfilled_with_option_id = current_params.option_id;
        swap_proposal.fulfilled_by = self.signer.key().clone();

        // find the option id
        let desired_option = swap_proposal.swap_options
            .iter_mut()
            .find(|x| x.id == params.option_id.clone())
            .unwrap();

        // find the swap item
        let item = desired_option.asking_items
            .iter_mut()
            .find(|x| x.id == current_params.swap_item_id.clone())
            .unwrap();

        // Raise error
        if item.status != SwapItemStatus::Created {
            return Err(SwapError::FulfillingIsNotAvailable.into());
        }

        // transfer the token
        token::transfer(
            CpiContext::new(
                self.token_program.to_account_info(),
                Transfer {
                    from: self.signer_token_account.to_account_info(),
                    to: self.swap_token_vault.to_account_info(),
                    authority: self.signer.to_account_info(),
                },
            ),
            item.amount,
        ).unwrap();

        // update the item status
        item.status = SwapItemStatus::Deposited;
        item.owner = self.signer.key().clone();

        swap_emit!(
            ItemDeposited {
                id: item.id.clone(),
                status: SwapItemStatus::Deposited,
                proposal_key: swap_proposal_key,
                actor: self.signer.key().clone(),
            }
        );

        // update the proposal status if applicable
        if (desired_option.asking_items
            .iter()
            .filter(|&x| x.status == SwapItemStatus::Deposited)
            .count()
        ) == desired_option.asking_items.len() {
            swap_proposal.status = SwapProposalStatus::Fulfilled;

            // emit event
            swap_emit!(
                ProposalFulfilled {
                    status: SwapProposalStatus::Fulfilled,
                    actor: self.signer.key().clone(),
                    proposal_key: swap_proposal_key,
                    id: swap_proposal.id.clone()
                }
            );
        }

        return Ok(());
    }
}