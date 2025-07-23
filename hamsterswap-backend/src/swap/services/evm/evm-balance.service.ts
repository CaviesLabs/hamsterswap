import { Injectable } from '@nestjs/common';

import { NetworkProvider } from '../../../providers/network.provider';
import { OpenSeaProvider } from '../../../providers/opensea.provider';
import { DebankProvider } from '../../../providers/debank.provider';
import { SeitraceProvider } from '../../../providers/seitrace.provider';
import { RegistryProvider } from '../../../providers/registry.provider';
import { EvmMetadataService } from './evm-metadata.service';
import { ChainId } from '../../entities/swap-platform-config.entity';
import {
  NFTBalanceEntity,
  TokenBalanceEntity,
} from '../../entities/token-balance.entity';
import { TokenMetadata } from '../../entities/token-metadata.entity';

@Injectable()
export class EvmBalanceService {
  private readonly openseaProvider: OpenSeaProvider;
  private readonly debankProvider: DebankProvider;
  private readonly seitraceProvider: SeitraceProvider;

  constructor(
    private readonly evmMetadataService: EvmMetadataService,
    private readonly networkProvider: NetworkProvider,
    private readonly registry: RegistryProvider,
  ) {
    this.openseaProvider = new OpenSeaProvider(
      this.registry,
      this.networkProvider,
    );
    this.debankProvider = new DebankProvider(
      this.registry,
      this.networkProvider,
    );
    this.seitraceProvider = new SeitraceProvider(
      this.registry,
      this.networkProvider,
    );
  }

  /**
   * @notice Get token balances - uses Seitrace for Sei chain, Debank for others
   * @param chainId
   * @param ownerAddress
   */
  public async getTokenBalances(
    chainId: ChainId,
    ownerAddress: string,
  ): Promise<TokenBalanceEntity[]> {
    // Use Seitrace for Sei chain
    if (chainId === ChainId.Sei) {
      return this.getSeiTokenBalances(chainId, ownerAddress);
    }

    // Use Debank for other chains
    return this.getDebankTokenBalances(chainId, ownerAddress);
  }

  /**
   * @notice Get NFT balances - uses Seitrace for Sei chain, Debank for others
   * @param chainId
   * @param ownerAddress
   */
  public async getNftBalances(
    chainId: ChainId,
    ownerAddress: string,
  ): Promise<NFTBalanceEntity[]> {
    // Use Seitrace for Sei chain
    if (chainId === ChainId.Sei) {
      return this.getSeiNftBalances(chainId, ownerAddress);
    }

    // Use Debank for other chains
    return this.getDebankNftBalances(chainId, ownerAddress);
  }

  /**
   * @notice Get token balances from Seitrace for Sei chain
   * @param chainId
   * @param ownerAddress
   * @private
   */
  private async getSeiTokenBalances(
    chainId: ChainId,
    ownerAddress: string,
  ): Promise<TokenBalanceEntity[]> {
    try {
      const rawTokenBalances = await this.seitraceProvider.getAllErc20Balances(
        'pacific-1', // Default to pacific-1, could be made configurable
        ownerAddress,
      );

      return rawTokenBalances
        .filter((balance) => parseFloat(balance.amount) > 0) // Filter out zero balances
        .map((balance) => {
          const metadata: TokenMetadata = {
            icon: balance.token_logo,
            name: balance.token_name,
            symbol: balance.token_symbol,
            decimals: parseInt(balance.token_decimals),
            address: balance.token_contract,
            chainId,
            isWhiteListed: !!this.registry.findToken(
              chainId,
              balance.token_contract,
            ),
          };

          return {
            ...metadata,
            amount: parseFloat(balance.amount),
            rawAmount: parseInt(balance.raw_amount),
            rawAmountHex: `0x${parseInt(balance.raw_amount).toString(16)}`,
          } as TokenBalanceEntity;
        });
    } catch (error) {
      console.error(
        `Failed to get Sei token balances for ${ownerAddress}:`,
        error,
      );
      return [];
    }
  }

  /**
   * @notice Get NFT balances from Seitrace for Sei chain
   * @param chainId
   * @param ownerAddress
   * @private
   */
  private async getSeiNftBalances(
    chainId: ChainId,
    ownerAddress: string,
  ): Promise<NFTBalanceEntity[]> {
    try {
      const rawNftBalances = await this.seitraceProvider.getAllErc721Balances(
        'pacific-1', // Default to pacific-1, could be made configurable
        ownerAddress,
      );

      return rawNftBalances.map((balance) => {
        const mappedCollection = this.registry.findCollection(
          chainId,
          balance.token_contract,
        );

        // Parse metadata to extract image and attributes
        const metadata = this.parseTokenMetadata(balance.token_metadata);

        return {
          id: balance.token_id,
          tokenId: Number(balance.token_id),
          address: balance.token_contract,
          chainId,
          collectionId: `${chainId}:${balance.token_contract}`,
          collectionSlug:
            mappedCollection?.collectionId ||
            balance.token_symbol.toLowerCase(),
          collectionName: mappedCollection?.name || balance.token_name,
          collectionUrl: mappedCollection?.marketUrl,
          isWhiteListed: !!mappedCollection,
          image: metadata.image || '',
          name: metadata.name || `${balance.token_name} #${balance.token_id}`,
          attributes: metadata.attributes || [],
        } as NFTBalanceEntity;
      });
    } catch (error) {
      console.error(
        `Failed to get Sei NFT balances for ${ownerAddress}:`,
        error,
      );
      return [];
    }
  }

  /**
   * @notice Get token balances from Debank (fallback for non-Sei chains)
   * @param chainId
   * @param ownerAddress
   * @private
   */
  private async getDebankTokenBalances(
    chainId: ChainId,
    ownerAddress: string,
  ): Promise<TokenBalanceEntity[]> {
    const rawTokenBalances = await this.debankProvider.getTokenBalances(
      chainId,
      ownerAddress,
    );

    return rawTokenBalances.map((balance) => {
      const metadata = {
        icon: balance.logo_url,
        name: balance.name,
        symbol: balance.symbol,
        decimals: balance.decimals,
        address: balance.id,
        chainId,
        isWhiteListed: !!this.registry.findToken(chainId, balance.id),
      } as TokenMetadata;

      return {
        ...metadata,
        amount: balance.amount,
        rawAmount: balance.raw_amount,
        rawAmountHex: balance.raw_amount_hex_str,
      } as TokenBalanceEntity;
    });
  }

  /**
   * @notice Get NFT balances from Debank (fallback for non-Sei chains)
   * @param chainId
   * @param ownerAddress
   * @private
   */
  private async getDebankNftBalances(
    chainId: ChainId,
    ownerAddress: string,
  ): Promise<NFTBalanceEntity[]> {
    const rawNftBalances = await this.debankProvider.getNftBalances(
      chainId,
      ownerAddress,
    );

    return rawNftBalances.map((balance) => {
      const mappedCollection = this.registry.findCollection(
        chainId,
        balance.contract_id,
      );

      return {
        id: balance.inner_id,
        tokenId: Number(balance.inner_id),
        address: balance.contract_id,
        chainId,
        collectionId: `${chainId}:${balance.contract_id}`,
        collectionSlug: mappedCollection?.collectionId,
        collectionName: mappedCollection?.name,
        collectionUrl: mappedCollection?.marketUrl,
        isWhiteListed: !!mappedCollection,
        image: balance.content,
        name: balance.name,
        attributes: balance.attributes,
      } as NFTBalanceEntity;
    });
  }

  /**
   * @notice Parse token metadata string to extract useful information
   * @param metadataString
   * @private
   */
  private parseTokenMetadata(metadataString: string | null): {
    image?: string;
    name?: string;
    attributes?: any[];
  } {
    if (!metadataString) {
      return {};
    }

    try {
      const metadata = JSON.parse(metadataString);
      return {
        image: metadata.image || metadata.image_url || '',
        name: metadata.name || '',
        attributes: metadata.attributes || [],
      };
    } catch (error) {
      console.error('Failed to parse token metadata:', error);
      return {};
    }
  }

  /**
   * @notice Get comprehensive token portfolio for Sei chain
   * @param ownerAddress
   */
  public async getSeiTokenPortfolio(ownerAddress: string) {
    if (!ownerAddress) {
      throw new Error('Owner address is required');
    }

    try {
      const portfolio = await this.seitraceProvider.getTokenPortfolio(
        'pacific-1',
        ownerAddress,
      );

      return {
        address: ownerAddress,
        chainId: ChainId.Sei,
        erc20Tokens: portfolio.erc20.map((token) => ({
          address: token.token_contract,
          name: token.token_name,
          symbol: token.token_symbol,
          decimals: parseInt(token.token_decimals),
          amount: parseFloat(token.amount),
          rawAmount: token.raw_amount,
          usdValue: token.total_usd_value
            ? parseFloat(token.total_usd_value)
            : null,
          logo: token.token_logo,
        })),
        erc721Tokens: portfolio.erc721.map((token) => ({
          address: token.token_contract,
          tokenId: token.token_id,
          name: token.token_name,
          symbol: token.token_symbol,
          metadata: token.token_metadata,
          collectionName: token.token_name,
        })),
        summary: {
          totalErc20Tokens: portfolio.totalErc20Tokens,
          totalErc721Tokens: portfolio.totalErc721Tokens,
          totalUsdValue: portfolio.totalUsdValue,
        },
      };
    } catch (error) {
      console.error(
        `Failed to get Sei token portfolio for ${ownerAddress}:`,
        error,
      );
      throw new Error('Failed to fetch token portfolio');
    }
  }
}
