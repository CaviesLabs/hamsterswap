import { useCallback, useMemo } from "react";
import {
  useEvmHamsterSwapContract,
  useEvmWallet,
} from "@/src/hooks/wagmi/useEvmWallet";
import { useMain } from "@/src/hooks/pages/main";

/**
 * @dev Export hook to use.
 */
export const useProgram = () => {
  const { chainId } = useMain();
  const { signer } = useEvmWallet();

  const {
    cancelProposal: cancelProposalEvm,
    fullFillProposal: swapProposalEvm,
  } = useEvmHamsterSwapContract();

  /**
   * @dev The function to cancel proposal.
   * @param {string} proposalId
   */
  const cancelProposal = useCallback(
    async (proposalId: string) => {
      return await cancelProposalEvm({ proposalId });
    },
    [chainId]
  );

  /**
   * @dev The function to swap proposal.
   * @param {string} proposalId
   * @param {string} optionId
   * @returns {Promise<void>}
   */
  const swapProposal = useCallback(
    async (
      proposalId: string,
      optionId: string,
      wrappedTokenAmount: bigint,
      wrappedRecipientTokenAmount?: bigint
    ) => {
      return await swapProposalEvm({
        proposalId,
        optionId,
        wrappedTokenAmount,
        wrappedRecipientTokenAmount,
      });
    },
    [chainId, signer, swapProposalEvm]
  );

  return useMemo(
    () => ({
      cancelProposal,
      swapProposal,
    }),
    [cancelProposal, swapProposalEvm, cancelProposalEvm, chainId, signer]
  );
};
