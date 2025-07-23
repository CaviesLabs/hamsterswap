import { NetworkProvider } from './network.provider';
import { RegistryProvider } from './registry.provider';
import { ChainId } from '../swap/entities/swap-platform-config.entity';

/**
 * Supported Seitrace chain IDs
 */
export type SeitraceChainId = 'pacific-1' | 'atlantic-2' | 'arctic-1';

/**
 * Base address interface with association information
 */
export interface AddressBase {
  address_hash: string;
  address_association: Association | null;
}

/**
 * Association information for addresses
 */
export interface Association {
  evm_hash: string;
  sei_hash: string;
  timestamp: string;
  tx_hash: string;
  type:
    | 'EOA'
    | 'TRANSACTION'
    | 'CREATE_CW20_POINTER'
    | 'CREATE_CW721_POINTER'
    | 'CREATE_ERC20_POINTER'
    | 'CREATE_ERC721_POINTER'
    | 'CREATE_NATIVE_POINTER';
}

/**
 * ERC20 Token Balance Interface
 */
export interface Erc20Balance {
  raw_amount: string;
  amount: string;
  token_usd_price: string | null;
  total_usd_value: string | null;
  wallet_address: AddressBase;
  token_contract: string;
  token_symbol: string;
  token_name: string;
  token_decimals: string;
  token_logo: string;
  token_type: string;
  token_association: Association | null;
}

/**
 * ERC721 Token (NFT) Interface
 */
export interface Erc721Token {
  owner: AddressBase;
  token_id: string;
  token_contract: string;
  token_association: Association | null;
  token_symbol: string;
  token_name: string;
  token_metadata: string | null;
}

/**
 * ERC20 Token Information Interface
 */
export interface Erc20TokenInfo {
  token_holder_count: string;
  token_raw_total_supply: string;
  token_total_supply: string;
  token_usd_price: string | null;
  total_usd_value: string | null;
  token_contract_address: string;
  token_symbol: string;
  token_name: string;
  token_decimals: string;
  token_description: string | null;
  token_type: 'ERC-721' | 'ERC-1155' | 'ERC-20' | 'CW-20' | 'CW-721';
  token_logo: string | null;
  token_metadata: string | null;
  token_association: Association | null;
}

/**
 * ERC721 Token Information Interface
 */
export interface Erc721TokenInfo {
  token_holder_count: string;
  token_raw_total_supply: string;
  token_total_supply: string;
  token_contract_address: string;
  token_symbol: string;
  token_name: string;
  token_type: 'ERC-721' | 'ERC-1155' | 'ERC-20' | 'CW-20' | 'CW-721';
  token_metadata: string | null;
  token_association: Association | null;
}

/**
 * Paginated response interfaces
 */
export interface PaginatedErc20Balance {
  items: Erc20Balance[];
  next_page_params: {
    address: string;
    token_contract_list?: string[];
    limit?: number;
    offset?: number;
    chain_id: SeitraceChainId;
  } | null;
}

export interface PaginatedErc721Balance {
  items: Erc721Token[];
  next_page_params: {
    address: string;
    token_contract_list?: string[];
    limit?: number;
    offset?: number;
    chain_id: SeitraceChainId;
  } | null;
}

/**
 * Request parameters interfaces
 */
export interface GetErc20BalancesParams {
  chain_id: SeitraceChainId;
  address: string;
  token_contract_list?: string[];
  limit?: number;
  offset?: number;
}

export interface GetErc721BalancesParams {
  chain_id: SeitraceChainId;
  address: string;
  token_contract_list?: string[];
  limit?: number;
  offset?: number;
}

export interface GetTokenInfoParams {
  chain_id: SeitraceChainId;
  contract_address: string;
}

/**
 * @notice SeitraceProvider is a provider for interacting with Seitrace Insights API
 * Provides access to ERC20 and ERC721 token data on Sei blockchain
 */
export class SeitraceProvider {
  private readonly baseUrl = 'https://seitrace.com/insights';

  constructor(
    private readonly registry: RegistryProvider,
    private readonly networkProvider: NetworkProvider,
  ) {}

  /**
   * @notice Get API configuration with API key
   * @param chainId - Sei chain ID
   * @private
   */
  private getConfig() {
    const apiKey = this.registry.getConfig().NETWORKS['sei'].SEITRACE_API_KEY;

    return {
      headers: {
        'x-api-key': apiKey,
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
    };
  }

  /**
   * @notice Build query string from parameters
   * @param params - Query parameters object
   * @private
   */
  private buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((item) => searchParams.append(key, item.toString()));
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });

    return searchParams.toString();
  }

  /**
   * @notice Get ERC20 token balances for a wallet address
   * @param params - Request parameters
   * @returns Promise<PaginatedErc20Balance>
   */
  public async getErc20Balances(
    params: GetErc20BalancesParams,
  ): Promise<PaginatedErc20Balance> {
    const config = this.getConfig();
    const queryString = this.buildQueryString(params);
    const url = `${this.baseUrl}/api/v2/token/erc20/balances?${queryString}`;

    return this.networkProvider.request<PaginatedErc20Balance>(url, {
      method: 'GET',
      headers: config.headers,
    });
  }

  /**
   * @notice Get ERC721 token balances (NFTs) for a wallet address
   * @param params - Request parameters
   * @returns Promise<PaginatedErc721Balance>
   */
  public async getErc721Balances(
    params: GetErc721BalancesParams,
  ): Promise<PaginatedErc721Balance> {
    const config = this.getConfig();
    const queryString = this.buildQueryString(params);
    const url = `${this.baseUrl}/api/v2/token/erc721/balances?${queryString}`;

    return this.networkProvider.request<PaginatedErc721Balance>(url, {
      method: 'GET',
      headers: config.headers,
    });
  }

  /**
   * @notice Get ERC20 token information
   * @param params - Request parameters
   * @returns Promise<Erc20TokenInfo>
   */
  public async getErc20TokenInfo(
    params: GetTokenInfoParams,
  ): Promise<Erc20TokenInfo> {
    const config = this.getConfig();
    const queryString = this.buildQueryString(params);
    const url = `${this.baseUrl}/api/v2/token/erc20?${queryString}`;

    return this.networkProvider.request<Erc20TokenInfo>(url, {
      method: 'GET',
      headers: config.headers,
    });
  }

  /**
   * @notice Get ERC721 token information
   * @param params - Request parameters
   * @returns Promise<Erc721TokenInfo>
   */
  public async getErc721TokenInfo(
    params: GetTokenInfoParams,
  ): Promise<Erc721TokenInfo> {
    const config = this.getConfig();
    const queryString = this.buildQueryString(params);
    const url = `${this.baseUrl}/api/v2/token/erc721?${queryString}`;

    return this.networkProvider.request<Erc721TokenInfo>(url, {
      method: 'GET',
      headers: config.headers,
    });
  }

  /**
   * @notice Get all ERC20 token balances for a wallet (helper method)
   * @param chainId - Sei chain ID
   * @param address - Wallet address
   * @param tokenContracts - Optional list of specific token contracts to query
   * @returns Promise<Erc20Balance[]>
   */
  public async getAllErc20Balances(
    chainId: SeitraceChainId,
    address: string,
    tokenContracts?: string[],
  ): Promise<Erc20Balance[]> {
    let allBalances: Erc20Balance[] = [];
    let offset = 0;
    const limit = 50; // Maximum allowed by API

    while (true) {
      const result = await this.getErc20Balances({
        chain_id: chainId,
        address,
        token_contract_list: tokenContracts,
        limit,
        offset,
      });

      allBalances = allBalances.concat(result.items);

      // Break if no more pages
      if (!result.next_page_params || result.items.length < limit) {
        break;
      }

      offset += limit;
    }

    return allBalances;
  }

  /**
   * @notice Get all ERC721 token balances for a wallet (helper method)
   * @param chainId - Sei chain ID
   * @param address - Wallet address
   * @param tokenContracts - Optional list of specific token contracts to query
   * @returns Promise<Erc721Token[]>
   */
  public async getAllErc721Balances(
    chainId: SeitraceChainId,
    address: string,
    tokenContracts?: string[],
  ): Promise<Erc721Token[]> {
    let allBalances: Erc721Token[] = [];
    let offset = 0;
    const limit = 50; // Maximum allowed by API

    while (true) {
      const result = await this.getErc721Balances({
        chain_id: chainId,
        address,
        token_contract_list: tokenContracts,
        limit,
        offset,
      });

      allBalances = allBalances.concat(result.items);

      // Break if no more pages
      if (!result.next_page_params || result.items.length < limit) {
        break;
      }

      offset += limit;
    }

    return allBalances;
  }

  /**
   * @notice Get combined token portfolio for a wallet (both ERC20 and ERC721)
   * @param chainId - Sei chain ID
   * @param address - Wallet address
   * @returns Promise with both ERC20 and ERC721 balances
   */
  public async getTokenPortfolio(chainId: SeitraceChainId, address: string) {
    const [erc20Balances, erc721Balances] = await Promise.all([
      this.getAllErc20Balances(chainId, address),
      this.getAllErc721Balances(chainId, address),
    ]);

    return {
      erc20: erc20Balances,
      erc721: erc721Balances,
      totalErc20Tokens: erc20Balances.length,
      totalErc721Tokens: erc721Balances.length,
      totalUsdValue: erc20Balances.reduce((sum, token) => {
        const value = parseFloat(token.total_usd_value || '0');
        return sum + (isNaN(value) ? 0 : value);
      }, 0),
    };
  }
}
