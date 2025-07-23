import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';

import { TokenMetadataModel } from '../../../orm/model/token-metadata.model';
import { NetworkProvider } from '../../../providers/network.provider';
import { OpenSeaProvider } from '../../../providers/opensea.provider';
import { DebankProvider } from '../../../providers/debank.provider';
import { SeitraceProvider } from '../../../providers/seitrace.provider';
import {
  NFTMetadata,
  TokenMetadata,
} from '../../entities/token-metadata.entity';
import { ChainId } from '../../entities/swap-platform-config.entity';
import { RegistryProvider } from '../../../providers/registry.provider';

@Injectable()
export class EvmMetadataService {
  private readonly openseaProvider: OpenSeaProvider;
  private readonly debankProvider: DebankProvider;
  private readonly seitraceProvider: SeitraceProvider;

  constructor(
    @InjectRepository(TokenMetadataModel)
    private readonly tokenMetadataRepo: Repository<TokenMetadataModel>,
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
   * @notice Get NFT metadata - uses Seitrace for Sei chain, OpenSea for others
   * @param chainId
   * @param contractAddress
   * @param tokenId
   */
  public async getNftMetadata(
    chainId: ChainId,
    contractAddress: string,
    tokenId: string,
  ): Promise<TokenMetadataModel> {
    const existedTokenMetadata = await this.tokenMetadataRepo.findOneBy({
      mintAddress: `${chainId}:${contractAddress}:${tokenId}`,
    });

    if (existedTokenMetadata) {
      return existedTokenMetadata;
    }

    // Use Seitrace for Sei chain
    if (chainId === ChainId.Sei) {
      return this.getSeiNftMetadata(chainId, contractAddress, tokenId);
    }

    // Use OpenSea for other chains
    return this.getOpenSeaNftMetadata(chainId, contractAddress, tokenId);
  }

  /**
   * @notice Get token metadata - uses Seitrace for Sei chain, Debank for others
   * @param chainId
   * @param tokenAddress
   */
  public async getTokenMetadata(
    chainId: ChainId,
    tokenAddress: string,
  ): Promise<TokenMetadataModel> {
    const existedTokenMetadata = await this.tokenMetadataRepo.findOneBy({
      mintAddress: `${chainId}:${tokenAddress}`,
    });

    if (existedTokenMetadata) {
      return existedTokenMetadata;
    }

    // Use Seitrace for Sei chain
    if (chainId === ChainId.Sei) {
      return this.getSeiTokenMetadata(chainId, tokenAddress);
    }

    // Use Debank for other chains
    return this.getDebankTokenMetadata(chainId, tokenAddress);
  }

  /**
   * @notice Get NFT metadata from Seitrace for Sei chain
   * @param chainId
   * @param contractAddress
   * @param tokenId
   * @private
   */
  private async getSeiNftMetadata(
    chainId: ChainId,
    contractAddress: string,
    tokenId: string,
  ): Promise<TokenMetadataModel> {
    try {
      // Get ERC721 token info from Seitrace
      const tokenInfo = await this.seitraceProvider.getErc721TokenInfo({
        chain_id: 'pacific-1', // Default to pacific-1, could be made configurable
        contract_address: contractAddress,
      });

      // Get specific token instances to find the token
      const tokenInstances = await this.seitraceProvider.getErc721Balances({
        chain_id: 'pacific-1',
        address: contractAddress, // This might need adjustment based on actual usage
        token_contract_list: [contractAddress],
        limit: 50,
      });

      const tokenInstance = tokenInstances.items.find(
        (token) => token.token_id === tokenId,
      );

      const collection = this.registry.findCollection(chainId, contractAddress);

      const nftMetadata: NFTMetadata = {
        id: tokenId,
        tokenId: Number(tokenId),
        address: contractAddress,
        attributes: tokenInstance?.token_metadata
          ? this.parseNftAttributes(tokenInstance.token_metadata)
          : [],
        image: tokenInstance?.token_metadata
          ? this.extractImageFromMetadata(tokenInstance.token_metadata)
          : '',
        name: tokenInfo.token_name || `${tokenInfo.token_symbol} #${tokenId}`,
        collectionId: `${chainId}:${contractAddress}`,
        collectionSlug: tokenInfo.token_symbol.toLowerCase(),
        isWhiteListed: !!collection,
        collectionName: collection?.name || tokenInfo.token_name,
        collectionUrl: collection?.marketUrl,
        chainId,
      };

      return this.persistNftMetadata(chainId, contractAddress, nftMetadata);
    } catch (error) {
      console.error(
        `Failed to get Sei NFT metadata for ${contractAddress}:${tokenId}:`,
        error,
      );
      // Fallback to basic metadata
      return this.createFallbackNftMetadata(chainId, contractAddress, tokenId);
    }
  }

  /**
   * @notice Get token metadata from Seitrace for Sei chain
   * @param chainId
   * @param tokenAddress
   * @private
   */
  private async getSeiTokenMetadata(
    chainId: ChainId,
    tokenAddress: string,
  ): Promise<TokenMetadataModel> {
    try {
      const tokenInfo = await this.seitraceProvider.getErc20TokenInfo({
        chain_id: 'pacific-1', // Default to pacific-1, could be made configurable
        contract_address: tokenAddress,
      });

      const tokenMetadata: TokenMetadata = {
        icon: tokenInfo.token_logo || '',
        name: tokenInfo.token_name,
        symbol: tokenInfo.token_symbol,
        address: tokenAddress,
        decimals: parseInt(tokenInfo.token_decimals),
        isWhiteListed: !!this.registry.findToken(chainId, tokenAddress),
        chainId,
      };

      return this.persistTokenMetadata(chainId, tokenAddress, tokenMetadata);
    } catch (error) {
      console.error(
        `Failed to get Sei token metadata for ${tokenAddress}:`,
        error,
      );
      // Fallback to basic metadata
      return this.createFallbackTokenMetadata(chainId, tokenAddress);
    }
  }

  /**
   * @notice Get NFT metadata from OpenSea (fallback for non-Sei chains)
   * @param chainId
   * @param contractAddress
   * @param tokenId
   * @private
   */
  private async getOpenSeaNftMetadata(
    chainId: ChainId,
    contractAddress: string,
    tokenId: string,
  ): Promise<TokenMetadataModel> {
    const { nft: data } = await this.openseaProvider.getOpenSeaNftData(
      chainId,
      contractAddress,
      tokenId,
    );

    const collection = this.registry.findCollection(chainId, contractAddress);

    const nftMetadata: NFTMetadata = {
      id: tokenId,
      tokenId: Number(tokenId),
      address: contractAddress,
      attributes: data.traits,
      image: data.image_url,
      name: data.name,
      collectionId: `${chainId}:${contractAddress}`,
      collectionSlug: data.collection,
      isWhiteListed: !!collection,
      collectionName: collection?.name,
      collectionUrl: collection?.marketUrl,
      chainId,
    };

    return this.persistNftMetadata(chainId, contractAddress, nftMetadata);
  }

  /**
   * @notice Get token metadata from Debank (fallback for non-Sei chains)
   * @param chainId
   * @param tokenAddress
   * @private
   */
  private async getDebankTokenMetadata(
    chainId: ChainId,
    tokenAddress: string,
  ): Promise<TokenMetadataModel> {
    const data = await this.debankProvider.getTokenInfo(chainId, tokenAddress);

    const tokenMetadata: TokenMetadata = {
      icon: data.logo_url,
      name: data.name,
      symbol: data.symbol,
      address: tokenAddress,
      decimals: data.decimals,
      isWhiteListed: !!this.registry.findToken(chainId, tokenAddress),
      chainId,
    };

    return this.persistTokenMetadata(chainId, tokenAddress, tokenMetadata);
  }

  /**
   * @notice Parse NFT attributes from metadata string
   * @param metadataString
   * @private
   */
  private parseNftAttributes(metadataString: string): any[] {
    try {
      const metadata = JSON.parse(metadataString);
      return metadata.attributes || [];
    } catch {
      return [];
    }
  }

  /**
   * @notice Extract image URL from metadata string
   * @param metadataString
   * @private
   */
  private extractImageFromMetadata(metadataString: string): string {
    try {
      const metadata = JSON.parse(metadataString);
      return metadata.image || metadata.image_url || '';
    } catch {
      return '';
    }
  }

  /**
   * @notice Create fallback NFT metadata when Seitrace fails
   * @param chainId
   * @param contractAddress
   * @param tokenId
   * @private
   */
  private createFallbackNftMetadata(
    chainId: ChainId,
    contractAddress: string,
    tokenId: string,
  ): Promise<TokenMetadataModel> {
    const collection = this.registry.findCollection(chainId, contractAddress);

    const nftMetadata: NFTMetadata = {
      id: tokenId,
      tokenId: Number(tokenId),
      address: contractAddress,
      attributes: [],
      image: '',
      name: `Token #${tokenId}`,
      collectionId: `${chainId}:${contractAddress}`,
      collectionSlug: contractAddress.toLowerCase(),
      isWhiteListed: !!collection,
      collectionName: collection?.name || 'Unknown Collection',
      collectionUrl: collection?.marketUrl,
      chainId,
    };

    return this.persistNftMetadata(chainId, contractAddress, nftMetadata);
  }

  /**
   * @notice Create fallback token metadata when Seitrace fails
   * @param chainId
   * @param tokenAddress
   * @private
   */
  private createFallbackTokenMetadata(
    chainId: ChainId,
    tokenAddress: string,
  ): Promise<TokenMetadataModel> {
    const tokenMetadata: TokenMetadata = {
      icon: '',
      name: 'Unknown Token',
      symbol: 'UNKNOWN',
      address: tokenAddress,
      decimals: 18, // Default decimals
      isWhiteListed: !!this.registry.findToken(chainId, tokenAddress),
      chainId,
    };

    return this.persistTokenMetadata(chainId, tokenAddress, tokenMetadata);
  }

  /**
   * @notice Persist token metadata
   * @param chainId
   * @param contractAddress
   * @param data
   */
  public persistTokenMetadata(
    chainId: ChainId,
    contractAddress: string,
    data: TokenMetadata,
  ): Promise<TokenMetadataModel> {
    return this.tokenMetadataRepo.save({
      mintAddress: `${chainId}:${contractAddress}`,
      metadata: data,
      isNft: false,
      chainId,
    });
  }

  /**
   * @notice Persist nft metadata
   * @param chainId
   * @param contractAddress
   * @param data
   */
  public persistNftMetadata(
    chainId: ChainId,
    contractAddress: string,
    data: NFTMetadata,
  ): Promise<TokenMetadataModel> {
    return this.tokenMetadataRepo.save({
      mintAddress: `${chainId}:${contractAddress}:${data.id}`,
      metadata: data,
      isNft: true,
      chainId,
    });
  }

  /**
   * @notice Get collection data
   * @param chainId
   * @param collectionId
   */
  public getCollectionData(chainId: ChainId, collectionId: string) {
    return this.registry.findCollection(chainId, collectionId);
  }
}
