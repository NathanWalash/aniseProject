// src/utils/contractAddresses.ts
type ContractName = 
  | 'DaoFactory' 
  | 'ModuleRegistry' 
  | 'Token' 
  | 'MemberLogic' 
  | 'ProposalLogic' 
  | 'ClaimLogic' 
  | 'TreasuryLogic' 
  | 'KernelLogic';

// AMOY (Polygon Testnet)
const addresses: Record<ContractName, string> = {
  DaoFactory: '0x0F9ED98ED7FAEC5C057DC2f0A4bAD6F86d88E18e',
  ModuleRegistry: '0xAb1BE2396334A3962Ea9CE34B75bA033d93d4094',
  Token: '0x7F9572CE7bc1EDd95b5176791604E110F7516916',
  MemberLogic: '0x8c21c95Fd6E1c579ba612bB47A6dc720449d30A6',
  ProposalLogic: '0x1e6c861Ae80082c702dA1750154B0bB568542782',
  ClaimLogic: '0xcf21df5A43373898DD2327EAE165E6ac1aA2CBFA',
  TreasuryLogic: '0x43C7B3216DcD6B680971c28160801a87cc9e12f6',
  KernelLogic: '0x6F4871F494007733A21f5242675EBB8f8a9caf54',
};

export const getContractAddress = (name: ContractName): string => {
  return addresses[name];
};
