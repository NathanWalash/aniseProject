// src/utils/contractAddresses.ts

// Contract names including modules
export type ContractName = 
  | 'DaoFactory' 
  | 'ModuleRegistry' 
  | 'Token' 
  | 'KernelLogic'
  | 'TreasuryLogic' 
  | 'MemberLogic' 
  | 'ProposalLogic' 
  | 'ClaimLogic' 
  | 'AnnouncementLogic'
  | 'TaskManagementLogic'
  | 'CalendarLogic'
  | 'DocumentSigningLogic';

// AMOY (Polygon Testnet)
const addresses: Record<ContractName, string> = {
  // Core Contracts
  DaoFactory: '0x510718C7d6C70F19def9400a81140349484c6E71',
  ModuleRegistry: '0xFA5437E49506d0950de61EFBbc08Fb6217Faac88',
  Token: '0x4C57781CBaD2667F8558603A19DAaCA1cFD3FB0D',
  KernelLogic: '0xD24Ef118e62A00091AEBA6f0Cec853053AEA27Bf',

  // Module Contracts
  TreasuryLogic: '0x9876543E9EBfc9597e50002c54CFa6Bbd9c90D79',
  MemberLogic: '0x9fc937c2C9246be6A47b2bD92051b24916C593E4',
  ProposalLogic: '0x33860de454e97c6107De593d59a72a0F176e5fde',
  ClaimLogic: '0x2aA66Cf5bD6CB5C42168F62E45d28AC76F7648e3',
  AnnouncementLogic: '0x6acb9eA16DB0AB2040F0F3230271924cF4dE4B60',
  TaskManagementLogic: '0x340408AD8a87f8aA9EAeAB6f5a1be036944E02Db',
  CalendarLogic: '0x3919641f6ef7e63abd198895476b656702095fE6',
  DocumentSigningLogic: '0x22980Ec6CB91301317CDE3767A8fa8b41a73265b',
};

// Safer accessor function
export const getContractAddress = (name: ContractName): string => {
  const address = addresses[name];
  if (!address) {
    throw new Error(`Contract address for ${name} is not defined.`);
  }
  return address;
};
