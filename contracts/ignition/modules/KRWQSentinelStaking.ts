import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const KRWQSentinelStakingModule = buildModule("KRWQSentinelStakingModule", (m) => {
  const staking = m.contract("KRWQSentinelStaking");

  return { staking };
});

export default KRWQSentinelStakingModule;