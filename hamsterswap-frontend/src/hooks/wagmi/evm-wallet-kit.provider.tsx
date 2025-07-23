import { createContext, useContext, ReactNode, FC } from "react";
import { RainbowKitProvider, lightTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, http } from "wagmi";
import { getDefaultConfig, Chain } from "@rainbow-me/rainbowkit";

/**
 * @dev Override rpc urls for sei.
 * @notice The default rpc url is not working.
 * @notice This is temporary solution.
 * @returns {void}
 * @todo Remove this when rpc url is working.
 */
const RPC_URL = "https://evm-rpc.sei-apis.com";
const seiMainnet = {
  id: 1329,
  name: "sei-mainnet",
  iconUrl: "https://seitrace.com/images/sei.svg",
  iconBackground: "#fff",
  nativeCurrency: { name: "Sei", symbol: "SEI", decimals: 18 },
  rpcUrls: {
    default: { http: [RPC_URL] },
  },
  blockExplorers: {
    default: { name: "SeiTrace", url: "https://seitrace.com" },
  },
  contracts: {
    multicall3: {
      address: "0xe50EbCf04083E4BDe13bbE0e5CA90595118F6cC3",
      blockCreated: 133_773_701,
    },
  },
} as Chain;
export const config = getDefaultConfig({
  appName: "HamsterSwap",
  projectId: process.env.WALLET_CONNECT_PROJECT_ID,
  chains: [seiMainnet],
  transports: {
    [seiMainnet.id]: http(),
  },
});
const queryClient = new QueryClient();

/** @dev Initiize context. */
export const WalletKitContext = createContext<any>(null);

/** @dev Expose wallet provider for usage. */
export const EvmWalletKitProvider: FC<{ children: ReactNode }> = (props) => {
  return (
    <WalletKitContext.Provider value={{}}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider
            coolMode={true}
            theme={lightTheme({
              accentColor: "#735CF7",
              accentColorForeground: "white",
              borderRadius: "small",
              fontStack: "system",
              overlayBlur: "small",
            })}
          >
            {props.children}
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </WalletKitContext.Provider>
  );
};

/** @dev Use context hook. */
export const useEvmWalletKit = () => {
  const context = useContext(WalletKitContext);
  if (!context) {
    throw new Error("Must be in provider");
  }
  return context;
};
