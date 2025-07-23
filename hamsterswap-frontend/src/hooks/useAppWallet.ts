import { useCallback, useMemo } from "react";
import { SIGN_MESSAGE } from "@/src/utils";
import { disconnect as disconnectWagmi } from "@wagmi/core";
import { getAuthService } from "@/src/actions/auth.action";
import { config, useEvmWallet, useSignEvmMessage } from "./wagmi";
import { useDispatch, useSelector } from "react-redux";
import { setProfile } from "@/src/redux/actions/hamster-profile/profile.action";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import State from "@/src/redux/entities/state";
import { useMain } from "./pages/main";

/**
 * @dev Get wallet address from useEvmWallet or useSolana
 * @notice This hook is used to get wallet address from useEvmWallet or useSolana
 * @returns {walletAddress: string}
 * @see src/hooks/useAppWallet.ts
 */
export const useAppWallet = () => {
  const { chainId } = useSelector((state: State) => state);
  const { walletAddress: evmAddress } = useEvmWallet();

  try {
    (window as any).hashmail.identify(evmAddress);
  } catch {}

  return useMemo(() => {
    return {
      walletAddress: evmAddress,
    };
  }, [chainId, evmAddress]);
};

/**
 * @dev Get native token from useEvmWallet or useSolana
 * @notice This hook is used to get native token from useEvmWallet or useSolana
 * @returns {nativeToken: TokenEntity}
 */
export const useNativeToken = () => {
  const { platformConfig } = useMain();
  return useMemo(() => {
    return {
      nativeToken: platformConfig?.allowCurrencies?.find(
        (item) => item.isNativeToken
      ),
    };
  }, [platformConfig]);
};

/**
 * @dev Get sign message from useEvmWallet or useSolana
 * @notice This hook is used to get sign message from useEvmWallet or useSolana
 * @returns {signMessage: Function}
 * @see src/hooks/useAppWallet.ts
 */
export const useIdpSignMessage = () => {
  const { chainId } = useSelector((state: State) => state);
  const signMessage = useSignEvmMessage(SIGN_MESSAGE);

  return {
    signIdpMessage: useCallback(async () => {
      // eslint-disable-next-line prettier/prettier
      return signMessage();
    }, [chainId, signMessage]),
  };
};

/**
 * @dev Get disconnect wallet from useEvmWallet or useSolana
 * @notice This hook is used to get disconnect wallet from useEvmWallet or useSolana
 * @returns {disconnect: Function}
 * @see src/hooks/useAppWallet.ts
 */
export const useDisconnectWallet = () => {
  const { chainId } = useSelector((state: State) => state);
  const dispatch = useDispatch();

  return {
    disconnect: useCallback(async () => {
      await getAuthService().logout();
      dispatch(setProfile(null));
      await disconnectWagmi(config);
      try {
        (window as any).hashmail.disconnect();
      } catch {}
    }, [chainId, dispatch]),
  };
};

/**
 * @dev Get native balance from useEvmWallet or useSolana
 * @notice This hook is used to get native balance from useEvmWallet or useSolana
 * @returns {nativeBalance: number}
 * @see src/hooks/useAppWallet.ts
 */
export const useNativeBalance = (): number => {
  const { chainId } = useSelector((state: State) => state);
  const { nativeBalance: evmBalance } = useEvmWallet();

  return useMemo(() => parseFloat(evmBalance), [chainId, evmBalance]);
};

/**
 * @dev Get connect wallet from useEvmWallet or useSolana
 * @notice This hook is used to get connect wallet from useEvmWallet or useSolana
 * @returns {connect: Function}
 * @see src/hooks/useAppWallet.ts
 */
export const useConnect = () => {
  const { chainId } = useSelector((state: State) => state);
  const { openConnectModal: connectEvm } = useConnectModal();

  return useMemo(
    () => ({
      connect: connectEvm,
    }),
    [chainId, connectEvm]
  );
};
