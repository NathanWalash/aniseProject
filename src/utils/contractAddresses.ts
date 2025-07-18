export const CONTRACT_ADDRESSES = {
  amoy: {
    ModuleRegistry: "0x63f106ACc32fcbADFFa0A866bDe314FBe264a827",
    Token:          "0x9702C131D66B37aBEcdA07c4b5eCE68562D18721",
    MemberLogic:    "0x93b4384cAD90Ef3cCE48DD20c832390024418B18",
    ProposalLogic:  "0xfFA03033fa93A15Dd026e9bf1fA12AE0fD679419",
    ClaimLogic:     "0xe07709d844D6F576c5B4022c4cCE126740E7Dd25",
    TreasuryLogic:  "0x10501078C355600e04A3445b90b3fDd65b28C39D",
    KernelLogic:    "0xff1275e34373024078155419fAa8C95Cdc59E698",
    DaoFactory:     "0x24e16Bc54A2f1Bcf832f1fc6fCC2356b8f8DF2Da"
  },
  // Add other networks as needed
};

export function getContractAddress(
  name: keyof typeof CONTRACT_ADDRESSES["amoy"],
  network: keyof typeof CONTRACT_ADDRESSES = "amoy"
) {
  return CONTRACT_ADDRESSES[network][name];
}
