import { networkProvider } from "@/src/providers/network.provider";
import {
  PlatformConfigDto,
  PlatformConfigDtoV2,
} from "@/src/entities/platform-config.entity";
import { ChainId } from "@/src/entities/chain.entity";

export class PlatformConfigService {
  /**
   * @dev The function to get platform config.
   * @param {ChainId} chainId.
   * @notice Correct entity to bridge solana.
   * @returns {Promise<PlatformConfigDto>}
   * @see src/entities/platform-config.entity.ts
   */
  async get(chainId: ChainId): Promise<PlatformConfigDto> {
    const v2PlatformConfig = await networkProvider.request<PlatformConfigDtoV2>(
      "/evm/platform-config",
      {}
    );

    return {
      ...v2PlatformConfig[chainId],
      maxAllowedItems: v2PlatformConfig[chainId].maxAllowedItems,
      maxAllowedOptions: v2PlatformConfig[chainId].maxAllowedOptions,
      allowNTFCollections: v2PlatformConfig[chainId].collections,
      allowCurrencies: v2PlatformConfig[chainId].currencies.map((item) => ({
        ...item,
        decimals: 9, // Bridge solana only support 9 decimals
        icon: item.icon || item.image,
        realDecimals: item.decimals,
        realAddress: item.address,
        address:
          item?.address || "0x" + Math.random().toString(16).slice(2, 10),
      })),
    };
  }
}

export const platformConfigService = new PlatformConfigService();
