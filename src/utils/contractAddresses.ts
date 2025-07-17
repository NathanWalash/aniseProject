export const CONTRACT_ADDRESSES = {
  amoy: {
    ModuleRegistry: "0x0A5f5F6e5C85e946e4b4A8C55913437BF90E9b23",
    Token: "0x227718474C2B8afB4bBdeB7EaeA8e54660CB42F8",
    MemberLogic: "0x85F1de536506dc3167187369281800c84B274453",
    ProposalLogic: "0xD8f2687D8c111BEc2AB6Da7342F256C7C27C1AaC",
    ClaimLogic: "0x846Ec69F1325C4ACc903fB3290625057e37e4B78",
    TreasuryLogic: "0xb3263A8F38c8D8E55Af0ae13e3C4734f49d01ABa",
    KernelLogic: "0x1b35f825Dfe867aE7d9Ec48515270eCF143FE378",
    DaoFactory: "0x746eb3F2B580234dc3660Ee2a2228f83e2100d60"
  }
  // Add other networks as needed
};

export function getContractAddress(name: keyof typeof CONTRACT_ADDRESSES["amoy"], network: keyof typeof CONTRACT_ADDRESSES = "amoy") {
  return CONTRACT_ADDRESSES[network][name];
} 