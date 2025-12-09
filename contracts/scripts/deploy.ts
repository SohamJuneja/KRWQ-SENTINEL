import hre from "hardhat";

async function main() {
  console.log("Deploying KRWQ Sentinel Staking Contract to Sepolia...");

  const publicClient = await hre.viem.getPublicClient();
  const [deployer] = await hre.viem.getWalletClients();
  
  const krwqStaking = await hre.viem.deployContract("KRWQSentinelStaking");

  console.log(`✅ KRWQSentinelStaking deployed to: ${krwqStaking.address}`);
  console.log(`\n📝 Deployment Info:`);
  console.log(`   Contract Address: ${krwqStaking.address}`);
  console.log(`   Network: ${hre.network.name}`);
  console.log(`   Deployer: ${deployer.account.address}`);
  console.log(`\n🔗 View on Etherscan:`);
  console.log(`   https://sepolia.etherscan.io/address/${krwqStaking.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
