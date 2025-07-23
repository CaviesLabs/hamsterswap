import { Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsObject,
  IsPort,
  IsString,
  IsUrl,
  validateSync,
} from 'class-validator';
import { plainToInstance } from 'class-transformer';

import * as fs from 'fs';
import { DatabaseType } from 'typeorm';
import {
  ChainConfigEntity,
  ChainId,
  WhitelistedCollection,
  WhitelistedCurrency,
} from '../swap/entities/swap-platform-config.entity';

export class SystemConfig {
  /**
   * @description Environment configs
   */
  @IsString()
  @IsNotEmpty()
  NODE_ENV;

  /**
   * @dev the version of current runner
   */
  @IsString()
  API_VERSION: string;

  /**
   * @description PORT and HOST config
   */
  @IsUrl({
    require_protocol: false,
  })
  HOST: string;

  /**
   * @description Port config
   */
  @IsPort()
  @IsNotEmpty()
  PORT: string;

  /**
   * @description Declare private key
   */
  @IsString()
  @IsNotEmpty()
  PRIVATE_KEY: string;

  /**
   * @description Declare public key
   */
  @IsString()
  @IsNotEmpty()
  PUBLIC_KEY: string;

  /**
   * @description Declare default audience
   */
  @IsString()
  @IsNotEmpty()
  DEFAULT_AUDIENCE: string;

  /**
   * @description Database Config
   */
  @IsString()
  @IsIn(['postgres', 'mysql', 'sqlite'])
  DB_ENGINE: DatabaseType;

  @IsUrl(
    { protocols: ['postgresql'], require_tld: false },
    {
      message: '$property should be a valid Postgres URL',
    },
  )
  DB_URL: string;

  /**
   * @description SMTP Configs
   */
  @IsUrl({
    require_protocol: false,
  })
  SMTP_EMAIL_HOST: string;

  @IsPort()
  @IsNotEmpty()
  SMTP_EMAIL_PORT: string;

  @IsBoolean()
  @IsNotEmpty()
  SMTP_EMAIL_TLS_ENABLED: boolean;

  @IsString()
  @IsNotEmpty()
  SMTP_EMAIL_USERNAME: string;

  @IsString()
  @IsNotEmpty()
  SMTP_EMAIL_PASSWORD: string;

  @IsString()
  @IsNotEmpty()
  SMTP_EMAIL_FROM_EMAIL: string;

  @IsString()
  @IsNotEmpty()
  SMTP_EMAIL_FROM_EMAIL_NAME: string;

  /**
   * @description AWS Configs
   */
  @IsString()
  @IsNotEmpty()
  AWS_SECRET_KEY_ID: string;

  @IsString()
  @IsNotEmpty()
  AWS_SECRET_ACCESS_KEY: string;

  @IsString()
  @IsNotEmpty()
  AWS_BUCKET_NAME: string;

  @IsString()
  @IsNotEmpty()
  AWS_BUCKET_REGION: string;

  /**
   * @description Other Configs
   */
  @IsString()
  @IsNotEmpty()
  SECRET_TOKEN: string;

  @IsUrl({
    require_protocol: false,
  })
  DOMAIN: string;

  @IsUrl({
    require_protocol: true,
  })
  HOST_URI: string;

  @IsString()
  @IsNotEmpty()
  SOLANA_CLUSTER: string;

  @IsString()
  @IsNotEmpty()
  SWAP_PROGRAM_ADDRESS: string;

  @IsString()
  @IsNotEmpty()
  SOLSCAN_API_KEY: string;

  @IsObject()
  NETWORKS: object;

  /**
   * @dev Validate schema.
   */
  public ensureValidSchema() {
    /***
     * @dev Validate config schema.
     */
    const errors = validateSync(this);
    /**
     * @dev Raise error if the config isn't valid
     */
    if (errors.length > 0) {
      throw new Error(JSON.stringify(errors.map((elm) => elm.constraints)));
    }
  }
}

@Global()
export class RegistryProvider {
  private static config: SystemConfig;

  constructor() {
    /**
     * @dev Load the config object single time.
     */
    if (!RegistryProvider.config) RegistryProvider.load();
  }

  /**
   * @dev Load config from file.
   */
  private static load() {
    /**
     * @dev Inject config service
     */
    const configService = new ConfigService();

    /**
     * @dev Read credentials file
     */
    const configFilePath = configService.get<string>('CONFIG_FILE', null);
    if (!configFilePath) {
      throw new Error('APPLICATION_BOOT::CONFIG_FILE_NOT_SET');
    }
    const file = fs.readFileSync(configFilePath);

    /**
     * @dev Construct system config
     */
    const data: SystemConfig = {
      /**
       * @dev load API_VERSION from package.json
       */
      API_VERSION: configService.get('npm_package_version', '0.0.0'),
      ...JSON.parse(file.toString()),
    };

    /**
     * @dev Transform config
     */
    RegistryProvider.config = plainToInstance(SystemConfig, data);
    RegistryProvider.config.ensureValidSchema();

    /**
     * @dev Make config object immutable
     */
    Object.freeze(RegistryProvider.config);
  }

  /**
   * @dev Get the config.
   * @returns System config object.
   */
  public getConfig(): SystemConfig {
    return RegistryProvider.config;
  }

  /**
   * @dev Get the whitelisted collection.
   * @param chainId
   * @param address
   */
  public findCollection(
    chainId: ChainId,
    address: string,
  ): WhitelistedCollection {
    return this.getChainConfig()[chainId].collections.find((col) =>
      col.addresses.includes(address),
    );
  }

  /**
   * @dev Get the whitelisted currency.
   * @param chainId
   * @param address
   */
  public findToken(chainId: ChainId, address: string): WhitelistedCurrency {
    return this.getChainConfig()[chainId].currencies.find(
      (col) => col.address === address,
    );
  }

  /**
   * @dev Get the chain config.
   */
  public getChainConfig(): ChainConfigEntity {
    return {
      [ChainId.Sei]: {
        wagmiKey: 'sei',
        chainName: 'Sei',
        chainIcon: 'https://seitrace.com/images/sei.svg',
        rpcUrl: this.getConfig().NETWORKS['sei'].RPC_URL,
        chainId: this.getConfig().NETWORKS['sei'].CHAIN_ID,
        programAddress: this.getConfig().NETWORKS['sei'].SWAP_PROGRAM_ADDRESS,
        multicall3Address:
          this.getConfig().NETWORKS['sei'].MULTICALL3_PROGRAM_ADDRESS,
        explorerUrl: 'https://seitrace.com/',
        maxAllowedItems: 4,
        maxAllowedOptions: 4,
        currencies: [
          {
            explorerUrl:
              'https://seitrace.com/token/0xE30feDd158A2e3b13e9badaeABaFc5516e95e8C7?chain=pacific-1',
            currencyId: 'wrapped-sei',
            address: '0xE30feDd158A2e3b13e9badaeABaFc5516e95e8C7',
            icon: 'https://raw.githubusercontent.com/Seitrace/sei-assetlist/main/images/WSEI.png',
            name: 'Wrapped SEI',
            symbol: 'WSEI',
            isNativeToken: true,
            decimals: 18,
          },
          {
            explorerUrl:
              'https://seitrace.com/token/0xe15fC38F6D8c56aF07bbCBe3BAf5708A2Bf42392?chain=pacific-1',
            currencyId: 'usd-coin',
            address: '0xe15fC38F6D8c56aF07bbCBe3BAf5708A2Bf42392',
            icon: 'https://raw.githubusercontent.com/Seitrace/sei-assetlist/main/images/USDCoin.svg',
            name: 'USDC',
            symbol: 'USDC',
            isNativeToken: false,
            decimals: 6,
          },
        ],
        collections: [
          {
            marketUrl: 'https://magiceden.io/collections/sei/yeiliens-4',
            addresses: ['0x59dd55283CC99fC9F50dA9E8cd0A680df2A5510f'],
            icon: 'https://img-cdn.magiceden.dev/rs:fill:400:0:0/plain/https%3A%2F%2Fmedia.cdn.magiceden.dev%2Flaunchpad%2F%2F243fcb42-2cf3-4911-9b2e-ba65e1b14af0',
            collectionId: 'yeiliens-4',
            name: 'Yeiliens',
          },
          {
            marketUrl: 'https://magiceden.io/collections/sei/crafty-canine-1',
            addresses: ['0xbCA0f3C93cD60c09274808BAddBcf6BDBeb139c0'],
            icon: 'https://img-cdn.magiceden.dev/rs:fill:400:0:0/plain/https%3A%2F%2Fbafybeiddsoqnyjdmmkz4njh6wjpfm5mgzopbke4df64f5pkg3jcqctadye.ipfs.w3s.link%2Fimage%2520(67).png',
            collectionId: 'crafty-canine-1',
            name: 'Crafty Canine',
          },
          {
            marketUrl: 'https://magiceden.io/collections/sei/foru-ai-genesis',
            addresses: ['0x1F963C268e711d09f7A9173532665d9c4491120A'],
            icon: 'https://img-cdn.magiceden.dev/rs:fill:400:0:0/plain/https%3A%2F%2Fimg.reservoir.tools%2Fimages%2Fv2%2Fsei%2Fkhnv7QtJSsXhx7z5lxeoZw2EKbT%252FMuas5A4YtFB3O0SEyj2sJ7Hs34IW1n0yRmG3K%252FbKS8O1KS7gvOwFQpjaBV2yBr4LmOHfGy5NcCWik8GtJIES1zBL7n4gu5vMg%252FHM5zy6RfaepFoj%252FvrVhteayZukmHOi6HHA3ZoFOPqJ0CFdWQYItD12Tlfug1%252BDGQuCOO2GGp%252BHFSPO7xEcqs5ohQ%253D%253D',
            collectionId: 'foru-ai-genesis',
            name: 'ForU AI Genesis',
          },
          {
            marketUrl: 'https://magiceden.io/collections/sei/webump-1',
            addresses: ['0xCF57971769E2abE438C9644655Bd7Ae0F2f9feC8'],
            icon: 'https://img-cdn.magiceden.dev/rs:fill:400:0:0/plain/https%3A%2F%2Fimg.reservoir.tools%2Fimages%2Fv2%2Fsei%2Fz9JRSpLYGu7%252BCZoKWtAuAIYpev452AQgX6bsora2mDehsiO8ifXnTxzTZi42dRml3lFlZbXsD82O9L8D6%252FWLzm4oEmKXHBEouAGi2Qt9Tm9kFBmNR1V6D0ydBtgkz3MS7JM%252FPld9zU%252Blp%252B6NhVnXAw%253D%253D',
            collectionId: 'webump-1',
            name: 'WeBump',
          },
          {
            marketUrl: 'https://magiceden.io/collections/sei/sagaofsei',
            addresses: ['0xe8835036f4007a9781820c62C487d592AD9801be'],
            icon: 'https://img-cdn.magiceden.dev/rs:fill:400:0:0/plain/https%3A%2F%2Fimg.reservoir.tools%2Fimages%2Fv2%2Fsei%2Fkhnv7QtJSsXhx7z5lxeoZ2Ys%252B3SAbO0oXnHZWQzxm2HIVU08SX%252FUZQdjVlYPOOzIIpJB2IhOcQqlGtvWn1vm4vHeXE1MDwHFMV4Ew6in9YxNC66dw%252F5G6EehY5pXtZ0Avb7zLhAAZJNusejg97X4zvSFKT1sOpFj%252B8nAluoYANrBp%252BY8LXrnDkSgM7QGuHuz',
            collectionId: 'sagaofsei',
            name: 'Saga',
          },
          {
            marketUrl:
              'https://magiceden.io/collections/sei/0x19227e1ae76321be426538e05f3af81eabdf3f8a',
            addresses: ['0x19227e1ae76321be426538e05f3af81eabdf3f8a'],
            icon: 'https://img-cdn.magiceden.dev/rs:fill:400:0:0/plain/https%3A%2F%2Fbafybeiga63de6ehp6aokwx4afju5hdsdx72juusq773bhkzoq33rx3o7oa.ipfs.w3s.link%2FScreen%2520Shot%25202024-12-04%2520at%252011.49.18%2520pm.png',
            collectionId: '0x19227e1ae76321be426538e05f3af81eabdf3f8a',
            name: 'SeiPunks',
          },
          {
            marketUrl: 'https://magiceden.io/collections/sei/grand-gangsta-ids',
            addresses: ['0x7090e51db5a63640c3F091DA1B4F098A908E8DFa'],
            icon: 'https://img-cdn.magiceden.dev/rs:fill:400:0:0/plain/https%3A%2F%2Fimg.reservoir.tools%2Fimages%2Fv2%2Fsei%2Fz9JRSpLYGu7%252BCZoKWtAuAEaPekw4eyhAp5W%252FhuiJBJ9I9Gq8ksqMM3bnGeAgE0da04dymj8EHQBJv5vL1dr1rUbauqZsWpNzfQwzYIvXu%252BkqXOynQdCzF5mM%252FlUMFlrrfiS89HcMZAPyPzThoa38CQ%253D%253D',
            collectionId: 'grand-gangsta-ids',
            name: "Grand Gangsta ID's",
          },
          {
            marketUrl: 'https://magiceden.io/collections/sei/fuckersforlife',
            addresses: ['0x9a1e3d2a010Dbe576F9CccD57B2fC0dF96c8E44d'],
            icon: 'https://img-cdn.magiceden.dev/rs:fill:400:0:0/plain/https%3A%2F%2Fimg.reservoir.tools%2Fimages%2Fv2%2Fsei%2F%252F5Jbi0Ns6zow6QFNdglhEvuBK9SeRlHojihLJQlDQIBpqv%252FyYMLMFxPQacieUlyBlFCO69GZTwcSAmIPYmX4HdXhwqBQpkzIwfWafvyHHI1vLrkZopAG0j5Fqrot8nb0BS5TqEKS4d6WElQ3jXmbcj4Dav2oiii8efzdxw1Jd9c%253D',
            collectionId: 'fuckersforlife',
            name: 'Fuckers',
          },
          {
            marketUrl: 'https://magiceden.io/collections/sei/the-farmors-1',
            addresses: ['0x810A9d701d187FA7991659ca97279FbD49Dee8eB'],
            icon: 'https://img-cdn.magiceden.dev/rs:fill:400:0:0/plain/https%3A%2F%2Fimg.reservoir.tools%2Fimages%2Fv2%2Fsei%2Fkhnv7QtJSsXhx7z5lxeoZyABYdmrG9L4355lMl7FWlMtNhSTAdNNZwj%252BIxds2x0jirerW771pS%252FUipbUDrfbwKij6SrfB48G6tu4Q9gjZXrpke0tvIdxEnS8QPc8G76CXoe8NK3dDwqQJiuEdf2IJtv2VwHF56%252BtQ%252B3J3tRPruAv0im3Vn25SGVnXlHjkUxetHufu8Ra89VaBJxVaueshA%253D%253D',
            collectionId: 'the-farmors-1',
            name: 'The Farmors',
          },
          {
            marketUrl:
              'https://magiceden.io/collections/sei/0x368243ab380a664d55d64232ff20d2caa85cdb84',
            addresses: ['0x368243ab380a664d55d64232ff20d2caa85cdb84'],
            icon: 'https://img-cdn.magiceden.dev/rs:fill:400:0:0/plain/https%3A%2F%2Fimg.reservoir.tools%2Fimages%2Fv2%2Fsei%2FmlW7AvaWRvTlZvCoiaVc4eymqUAVGL0RrXv4xmjWFYZFFXu%252BzWXbs28TktH9o43vpiZTwETmJjXAFTz9hNbtGV2%252Bokor%252B1NjCajjtydMzGROJLWJYtoOkMZ9N6P%252FID63',
            collectionId: '0x368243ab380a664d55d64232ff20d2caa85cdb84',
            name: 'Pixel Thumbs',
          },
          {
            marketUrl:
              'https://magiceden.io/collections/sei/0xe6f70aa873d0c42cf17df178cefd893a2c5031b0',
            addresses: ['0xe6f70aa873d0c42cf17df178cefd893a2c5031b0'],
            icon: 'https://img-cdn.magiceden.dev/rs:fill:400:0:0/plain/https%3A%2F%2Fimg.reservoir.tools%2Fimages%2Fv2%2Fsei%2Fz9JRSpLYGu7%252BCZoKWtAuAGdWptlhC4UVqExq%252BIguqyGbz%252FhlMy395t3pRVDeXTfGHiE7dHVqP%252BYlFQwlNbmrhohmmcttMX829bRxUEXLAgv8Nv0DaDjA9TlnuS8SmBV6I3FKfTRRDOstEm2jtdlktA%253D%253D',
            collectionId: '0xe6f70aa873d0c42cf17df178cefd893a2c5031b0',
            name: 'Warp Bois',
          },
          {
            marketUrl: 'https://magiceden.io/collections/sei/theghostsei',
            addresses: ['0x80958DC45286f460eCbd174FD74e832Dd13AFED6'],
            icon: 'https://img-cdn.magiceden.dev/rs:fill:400:0:0/plain/https%3A%2F%2Fbafkreihzuw6ldhsbxalj5534gxyzixwy55vbjqhj65j6uurnv2ztdgnzeq.ipfs.w3s.link%2F',
            collectionId: 'theghostsei',
            name: 'TheGhostSei',
          },
        ],
      },
      // [ChainId.Solana]: {
      //   chainName: 'Solana',
      //   chainIcon:
      //     'https://assets.coingecko.com/coins/images/4128/small/solana.png',
      //   rpcUrl: this.getConfig().NETWORKS['solana'].RPC_URL,
      //   explorerUrl: 'https://solscan.io/',
      //   programAddress:
      //     this.getConfig().NETWORKS['solana'].SWAP_PROGRAM_ADDRESS,
      //   maxAllowedItems: 4,
      //   maxAllowedOptions: 4,
      //   collections: [
      //     {
      //       marketUrl: 'https://magiceden.io/marketplace/ancient8',
      //       addresses: [
      //         '3cf5721fbaf1a81f69c6eeb833840e44e99955854d22f53ccd903581552e8e73',
      //       ],
      //       icon: 'https://www.arweave.net/56qWrf1lml3Bb5XgS_Ltlqtoaf3s0Qmu7t5OGMwN7DI?ext=png',
      //       collectionId: 'ancient8',
      //       name: 'Ancient 8 - The Generals',
      //     },
      //     {
      //       marketUrl: 'https://magiceden.io/marketplace/degods',
      //       addresses: [
      //         'a38e8d9d1a16b625978803a7d4eb512bc20ff880c8fd6cc667944a3d7b5e4acf',
      //       ],
      //       icon: 'https://metadata.degods.com/g/9999-dead.png',
      //       collectionId: 'degods',
      //       name: 'DeGods',
      //     },
      //     {
      //       marketUrl: 'https://magiceden.io/marketplace/just_tiger',
      //       addresses: [
      //         'b87cf16fde5ea9117831766cd0ca86f7ec7cc86aa78199ec26a81d5e37dee369',
      //       ],
      //       icon: 'https://nftstorage.link/ipfs/bafybeidklga2k23b7zxtlna5rcp2casiktfndvsxynimucwiiyvcgpqq54/84.png',
      //       collectionId: 'just-tiger',
      //       name: 'Just tiger',
      //     },
      //     {
      //       marketUrl: 'https://magiceden.io/marketplace/lurkers',
      //       addresses: [
      //         '2e44513374fb2e104fae68c9253432a143f5f3ec6e3549fa8235d06d77e7cddc',
      //       ],
      //       icon: 'https://nftstorage.link/ipfs/bafybeifwgtllf23btjjxfg72rhyuejo46jffm2mdr3mep4faewxferyqka/536.png',
      //       collectionId: 'lurker',
      //       name: 'Lurker',
      //     },
      //     {
      //       marketUrl: 'https://magiceden.io/marketplace/angry_cats_',
      //       addresses: [
      //         '903c2d6bb7b35fc58e9df37a4367dcbbafb905d08bdfdf7394544105b8d83106',
      //         'ab1b1471c5777b22cfe5ed92f8f735d85daedc1a68ced613886211aaf0941625',
      //       ],
      //       icon: 'https://nftstorage.link/ipfs/bafybeicvgxmua6v42tfek5llzw4vtqch43i4li3r7giqo7ebisndxytnuu/399.jpeg',
      //       collectionId: 'angry-cats',
      //       name: 'AngryCats',
      //     },
      //     {
      //       marketUrl: 'https://magiceden.io/marketplace/hasuki',
      //       addresses: [
      //         '47000db61c42e7613bf36f1fed177cbbb378b5ad61dfc4f06d1e80a8ad0aed9f',
      //       ],
      //       icon: 'https://nftstorage.link/ipfs/bafybeib7z3rbaodrg6l6zpypaamxxof3antmflllcfxt6vitovhh25ukyi/8690.png',
      //       collectionId: 'hasuki',
      //       name: 'Hasuki',
      //     },
      //     {
      //       marketUrl: 'https://magiceden.io/marketplace/fatalfoxesnft',
      //       addresses: [
      //         '951e97fc5b24026c3e6cab1de6810a5a9c1e936baa149e6e17a5d76a2dc8c273',
      //       ],
      //       icon: 'https://arweave.net/2CjjpF34uCI59Ab2jc017KMmqWKkZjZsLg8wLeOEb3s',
      //       collectionId: 'fatal-foxes',
      //       name: 'Fatal Foxes',
      //     },
      //     {
      //       marketUrl: 'https://magiceden.io/marketplace/splatterkids',
      //       collectionId: 'splatter-kids',
      //       addresses: [
      //         'c5491b3157ba13c779a0eca399572489d3cdd6daae6d5eb2d7ae1d599a012703',
      //       ],
      //       name: 'Splatter Kids',
      //       icon: 'https://nftstorage.link/ipfs/bafybeif7ydqzsfh44plj6jzl5emix6wkoviiri6ocydjk6lk3on65tdbhu/253.jpeg',
      //     },
      //     {
      //       marketUrl:
      //         'https://magiceden.io/marketplace/skully_boys_bones_club',
      //       collectionId: 'skully-boy-bones-club',
      //       addresses: [
      //         'c3e7928c1fad8ecb945fa365e4a7e485fead5d9db5b0b7a7d41c52f427e62a35',
      //       ],
      //       name: 'Skully Boys Bones Club',
      //       icon: 'https://www.arweave.net/t-ZGgtMW2-CFEEKLCrCk6UONh4yDW5yZKChcoRFoxs0?ext=png',
      //     },
      //     {
      //       marketUrl: 'https://magiceden.io/marketplace/degen_strays_club',
      //       collectionId: 'degen-strays-club',
      //       addresses: [
      //         '8c7df16222c60acf07d026a392e61dd15829e5da9902d3ba53977520bc25aa0f',
      //       ],
      //       name: 'Degen Strays Club',
      //       icon: 'https://arweave.net/Qzk6lNgzj_ylmjyvVWwE3mO_k-Q5nX9Uge2aC0MwDw4/2003.png',
      //     },
      //     {
      //       marketUrl: 'https://magiceden.io/marketplace/bitmon_creatures',
      //       collectionId: 'bitmon-creatures',
      //       addresses: [
      //         'be8d3f2975099d695c3b3414fedd95f85436ccd84687c1bbc0cc9e1175c704ba',
      //         '719cc0af4aeba42cb24c2053425a3969b3cd28a6f8b797be64f31c413edcad6d',
      //       ],
      //       name: 'Bitmons',
      //       icon: 'https://bitmon-images.bitmon.io/8emdpbxVaDZeixfTScGQFgdfwSaZKqHxPNs3vwjmGXc.png',
      //     },
      //   ],
      //   currencies: [
      //     {
      //       explorerUrl:
      //         'https://solscan.io/token/So11111111111111111111111111111111111111112',
      //       currencyId: 'solana',
      //       address: 'So11111111111111111111111111111111111111112',
      //       icon: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/icon.png',
      //       name: 'Solana',
      //       symbol: 'WSOL',
      //       isNativeToken: true,
      //       decimals: 9,
      //     },
      //     {
      //       explorerUrl:
      //         'https://solscan.io/token/DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
      //       currencyId: 'bonk',
      //       address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
      //       image:
      //         'https://arweave.net/hQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cSY7I',
      //       name: 'Bonk',
      //       symbol: 'BONK',
      //       isNativeToken: false,
      //       decimals: 5,
      //     },
      //     {
      //       explorerUrl:
      //         'https://solscan.io/token/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      //       currencyId: 'usd-coin',
      //       address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      //       image:
      //         'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/icon.png',
      //       name: 'USD Coin',
      //       symbol: 'USDC',
      //       isNativeToken: false,
      //       decimals: 6,
      //     },
      //   ],
      // },
    } as ChainConfigEntity;
  }
}
