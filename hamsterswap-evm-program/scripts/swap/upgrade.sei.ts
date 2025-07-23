import { ethers, upgrades } from "hardhat";
import { HamsterSwap } from "../../typechain-types";

async function main() {
  const Addresses = {
    HamsterSwapAddress: "0xC920c4A8Bd2776EC7B8A53Ab8390a4FB51282B33",
  };

  /**
   * @dev Deploy contract
   */
  const SwapContract = await ethers.getContractFactory("HamsterSwap");
  try {
    await upgrades.forceImport(Addresses.HamsterSwapAddress, SwapContract);
  } catch {
    console.log("skipped warning");
  }
  const Swap = (await upgrades.upgradeProxy(
    Addresses.HamsterSwapAddress,
    SwapContract,
    { unsafeAllow: ["delegatecall"] }
  )) as unknown as HamsterSwap;
  console.log("HamsterSwap upgraded at:", Swap.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
