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
  DaoFactory: '0x510718C7d6C70F19def9400a81140349484c6E71',
  ModuleRegistry: '0xFA5437E49506d0950de61EFBbc08Fb6217Faac88',
  Token: '0x4C57781CBaD2667F8558603A19DAaCA1cFD3FB0D',
  MemberLogic: '0x9fc937c2C9246be6A47b2bD92051b24916C593E4',
  ProposalLogic: '0x33860de454e97c6107De593d59a72a0F176e5fde',
  ClaimLogic: '0x2aA66Cf5bD6CB5C42168F62E45d28AC76F7648e3',
  TreasuryLogic: '0x9876543E9EBfc9597e50002c54CFa6Bbd9c90D79',
  KernelLogic: '0xD24Ef118e62A00091AEBA6f0Cec853053AEA27Bf',
};

export const getContractAddress = (name: ContractName): string => {
  return addresses[name];
};
