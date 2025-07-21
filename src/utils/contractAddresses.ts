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
  DaoFactory: '0xA4EDa6Bf8d644921031cf1af33D58d3d76820C4C',
  ModuleRegistry: '0xD301c4C7FFA07FBa994C90276E8d36e90204d462',
  Token: '0x4A130e2805f9E359784CD9089A77Af31005d2916',
  MemberLogic: '0x40BDAe5cD26f5aE2eF45e1b6676dee84D7B80509',
  ProposalLogic: '0x7676B80178785181Be7d27299B1828d06FA2610d',
  ClaimLogic: '0x219385103aF6dcd0E91c14f28DFEF86f62886e05',
  TreasuryLogic: '0x8E18f88678f05Df975FFEC172bf963D95876aB46',
  KernelLogic: '0x192e6a56a4dCb97503Bd6FD968Edca75Ff30691c',
};

export const getContractAddress = (name: ContractName): string => {
  return addresses[name];
};
