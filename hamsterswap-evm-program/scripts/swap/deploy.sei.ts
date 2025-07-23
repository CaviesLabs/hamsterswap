import { ethers, upgrades } from "hardhat";
import { Etherman, HamsterSwap } from "../../typechain-types";

async function main() {
  const EthermanFactory = await ethers.getContractFactory("Etherman");
  const EthermanContract = (await EthermanFactory.deploy(
    "0xE30feDd158A2e3b13e9badaeABaFc5516e95e8C7"
  )) as unknown as Etherman;

  const SwapContract = await ethers.getContractFactory("HamsterSwap");
  const Swap = (await upgrades.deployProxy(SwapContract, [], {
    unsafeAllow: ["constructor", "delegatecall"],
  })) as unknown as HamsterSwap;

  await Swap.deployed();

  await EthermanContract.transferOwnership(Swap.address);

  await Swap.configure(
    ethers.BigNumber.from("4"),
    ethers.BigNumber.from("4"),
    [
      {
        marketUrl: "https://magiceden.io/collections/sei/yeiliens-4",
        addresses: ["0x59dd55283CC99fC9F50dA9E8cd0A680df2A5510f"],
        icon: "https://img-cdn.magiceden.dev/rs:fill:400:0:0/plain/https%3A%2F%2Fmedia.cdn.magiceden.dev%2Flaunchpad%2F%2F243fcb42-2cf3-4911-9b2e-ba65e1b14af0",
        collectionId: "yeiliens-4",
        name: "Yeiliens",
      },
      {
        marketUrl: "https://magiceden.io/collections/sei/crafty-canine-1",
        addresses: ["0xbCA0f3C93cD60c09274808BAddBcf6BDBeb139c0"],
        icon: "https://img-cdn.magiceden.dev/rs:fill:400:0:0/plain/https%3A%2F%2Fbafybeiddsoqnyjdmmkz4njh6wjpfm5mgzopbke4df64f5pkg3jcqctadye.ipfs.w3s.link%2Fimage%2520(67).png",
        collectionId: "crafty-canine-1",
        name: "Crafty Canine",
      },
      {
        marketUrl: "https://magiceden.io/collections/sei/foru-ai-genesis",
        addresses: ["0x1F963C268e711d09f7A9173532665d9c4491120A"],
        icon: "https://img-cdn.magiceden.dev/rs:fill:400:0:0/plain/https%3A%2F%2Fimg.reservoir.tools%2Fimages%2Fv2%2Fsei%2Fkhnv7QtJSsXhx7z5lxeoZw2EKbT%252FMuas5A4YtFB3O0SEyj2sJ7Hs34IW1n0yRmG3K%252FbKS8O1KS7gvOwFQpjaBV2yBr4LmOHfGy5NcCWik8GtJIES1zBL7n4gu5vMg%252FHM5zy6RfaepFoj%252FvrVhteayZukmHOi6HHA3ZoFOPqJ0CFdWQYItD12Tlfug1%252BDGQuCOO2GGp%252BHFSPO7xEcqs5ohQ%253D%253D",
        collectionId: "foru-ai-genesis",
        name: "ForU AI Genesis",
      },
      {
        marketUrl: "https://magiceden.io/collections/sei/webump-1",
        addresses: ["0xCF57971769E2abE438C9644655Bd7Ae0F2f9feC8"],
        icon: "https://img-cdn.magiceden.dev/rs:fill:400:0:0/plain/https%3A%2F%2Fimg.reservoir.tools%2Fimages%2Fv2%2Fsei%2Fz9JRSpLYGu7%252BCZoKWtAuAIYpev452AQgX6bsora2mDehsiO8ifXnTxzTZi42dRml3lFlZbXsD82O9L8D6%252FWLzm4oEmKXHBEouAGi2Qt9Tm9kFBmNR1V6D0ydBtgkz3MS7JM%252FPld9zU%252Blp%252B6NhVnXAw%253D%253D",
        collectionId: "webump-1",
        name: "WeBump",
      },
      {
        marketUrl: "https://magiceden.io/collections/sei/sagaofsei",
        addresses: ["0xe8835036f4007a9781820c62C487d592AD9801be"],
        icon: "https://img-cdn.magiceden.dev/rs:fill:400:0:0/plain/https%3A%2F%2Fimg.reservoir.tools%2Fimages%2Fv2%2Fsei%2Fkhnv7QtJSsXhx7z5lxeoZ2Ys%252B3SAbO0oXnHZWQzxm2HIVU08SX%252FUZQdjVlYPOOzIIpJB2IhOcQqlGtvWn1vm4vHeXE1MDwHFMV4Ew6in9YxNC66dw%252F5G6EehY5pXtZ0Avb7zLhAAZJNusejg97X4zvSFKT1sOpFj%252B8nAluoYANrBp%252BY8LXrnDkSgM7QGuHuz",
        collectionId: "sagaofsei",
        name: "Saga",
      },
      {
        marketUrl:
          "https://magiceden.io/collections/sei/0x19227e1ae76321be426538e05f3af81eabdf3f8a",
        addresses: ["0x19227e1ae76321be426538e05f3af81eabdf3f8a"],
        icon: "https://img-cdn.magiceden.dev/rs:fill:400:0:0/plain/https%3A%2F%2Fbafybeiga63de6ehp6aokwx4afju5hdsdx72juusq773bhkzoq33rx3o7oa.ipfs.w3s.link%2FScreen%2520Shot%25202024-12-04%2520at%252011.49.18%2520pm.png",
        collectionId: "0x19227e1ae76321be426538e05f3af81eabdf3f8a",
        name: "SeiPunks",
      },
      {
        marketUrl: "https://magiceden.io/collections/sei/grand-gangsta-ids",
        addresses: ["0x7090e51db5a63640c3F091DA1B4F098A908E8DFa"],
        icon: "https://img-cdn.magiceden.dev/rs:fill:400:0:0/plain/https%3A%2F%2Fimg.reservoir.tools%2Fimages%2Fv2%2Fsei%2Fz9JRSpLYGu7%252BCZoKWtAuAEaPekw4eyhAp5W%252FhuiJBJ9I9Gq8ksqMM3bnGeAgE0da04dymj8EHQBJv5vL1dr1rUbauqZsWpNzfQwzYIvXu%252BkqXOynQdCzF5mM%252FlUMFlrrfiS89HcMZAPyPzThoa38CQ%253D%253D",
        collectionId: "grand-gangsta-ids",
        name: "Grand Gangsta ID's",
      },
      {
        marketUrl: "https://magiceden.io/collections/sei/fuckersforlife",
        addresses: ["0x9a1e3d2a010Dbe576F9CccD57B2fC0dF96c8E44d"],
        icon: "https://img-cdn.magiceden.dev/rs:fill:400:0:0/plain/https%3A%2F%2Fimg.reservoir.tools%2Fimages%2Fv2%2Fsei%2F%252F5Jbi0Ns6zow6QFNdglhEvuBK9SeRlHojihLJQlDQIBpqv%252FyYMLMFxPQacieUlyBlFCO69GZTwcSAmIPYmX4HdXhwqBQpkzIwfWafvyHHI1vLrkZopAG0j5Fqrot8nb0BS5TqEKS4d6WElQ3jXmbcj4Dav2oiii8efzdxw1Jd9c%253D",
        collectionId: "fuckersforlife",
        name: "Fuckers",
      },
      {
        marketUrl: "https://magiceden.io/collections/sei/the-farmors-1",
        addresses: ["0x810A9d701d187FA7991659ca97279FbD49Dee8eB"],
        icon: "https://img-cdn.magiceden.dev/rs:fill:400:0:0/plain/https%3A%2F%2Fimg.reservoir.tools%2Fimages%2Fv2%2Fsei%2Fkhnv7QtJSsXhx7z5lxeoZyABYdmrG9L4355lMl7FWlMtNhSTAdNNZwj%252BIxds2x0jirerW771pS%252FUipbUDrfbwKij6SrfB48G6tu4Q9gjZXrpke0tvIdxEnS8QPc8G76CXoe8NK3dDwqQJiuEdf2IJtv2VwHF56%252BtQ%252B3J3tRPruAv0im3Vn25SGVnXlHjkUxetHufu8Ra89VaBJxVaueshA%253D%253D",
        collectionId: "the-farmors-1",
        name: "The Farmors",
      },
      {
        marketUrl:
          "https://magiceden.io/collections/sei/0x368243ab380a664d55d64232ff20d2caa85cdb84",
        addresses: ["0x368243ab380a664d55d64232ff20d2caa85cdb84"],
        icon: "https://img-cdn.magiceden.dev/rs:fill:400:0:0/plain/https%3A%2F%2Fimg.reservoir.tools%2Fimages%2Fv2%2Fsei%2FmlW7AvaWRvTlZvCoiaVc4eymqUAVGL0RrXv4xmjWFYZFFXu%252BzWXbs28TktH9o43vpiZTwETmJjXAFTz9hNbtGV2%252Bokor%252B1NjCajjtydMzGROJLWJYtoOkMZ9N6P%252FID63",
        collectionId: "0x368243ab380a664d55d64232ff20d2caa85cdb84",
        name: "Pixel Thumbs",
      },
      {
        marketUrl:
          "https://magiceden.io/collections/sei/0xe6f70aa873d0c42cf17df178cefd893a2c5031b0",
        addresses: ["0xe6f70aa873d0c42cf17df178cefd893a2c5031b0"],
        icon: "https://img-cdn.magiceden.dev/rs:fill:400:0:0/plain/https%3A%2F%2Fimg.reservoir.tools%2Fimages%2Fv2%2Fsei%2Fz9JRSpLYGu7%252BCZoKWtAuAGdWptlhC4UVqExq%252BIguqyGbz%252FhlMy395t3pRVDeXTfGHiE7dHVqP%252BYlFQwlNbmrhohmmcttMX829bRxUEXLAgv8Nv0DaDjA9TlnuS8SmBV6I3FKfTRRDOstEm2jtdlktA%253D%253D",
        collectionId: "0xe6f70aa873d0c42cf17df178cefd893a2c5031b0",
        name: "Warp Bois",
      },
      {
        marketUrl: "https://magiceden.io/collections/sei/theghostsei",
        addresses: ["0x80958DC45286f460eCbd174FD74e832Dd13AFED6"],
        icon: "https://img-cdn.magiceden.dev/rs:fill:400:0:0/plain/https%3A%2F%2Fbafkreihzuw6ldhsbxalj5534gxyzixwy55vbjqhj65j6uurnv2ztdgnzeq.ipfs.w3s.link%2F",
        collectionId: "theghostsei",
        name: "TheGhostSei",
      },
    ].map((e) => e.addresses[0]),
    [],
    EthermanContract.address
  );

  console.log("HamsterSwap deployed at:", Swap.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
