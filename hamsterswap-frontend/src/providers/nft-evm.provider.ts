import { NftEntity, NftStatus } from "@/src/dto/nft.dto";

export class NftEvmProvider {
  /**
   * @dev The function to parse nft entity.
   * @param {NftEntity} data.
   * @returns {NftEntity}
   */
  public parseEntity(data: NftEntity): NftEntity {
    return {
      ...data,
      decimals: 0,
      status: NftStatus.holding,
      // random string for evm address
      address: data?.address || "0x" + Math.random().toString(16).slice(2, 10),
      realAddress: data?.address,
    };
  }
}
