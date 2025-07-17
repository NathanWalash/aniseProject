/*
 * Contract API Checklist for Anise Frontend
 *
 * For each function below, you will need the corresponding ABI JSON file.
 * Place each ABI in: aniseProject/src/services/abis/
 * Example: DaoFactory.json, KernelLogic.json, MemberLogic.json, ProposalLogic.json, ClaimLogic.json, TreasuryLogic.json, ModuleRegistry.json, Token.json
 *
 * When implementing, import the ABI at the top of this file:
 *   import DaoFactoryAbi from "./abis/DaoFactory.json";
 *   ...
 *
 * Use getContractAddress("ContractName", network) to get the address.
 *
 * Implement each function using ethers.Contract(address, ABI, provider/signer)
 *
 * Checklist below:
 */

import { ethers } from "ethers";
import { getContractAddress } from "../utils/contractAddresses";

// 1. DAOs
// =======
// Get all DAOs
export async function getAllDaos(provider: ethers.Provider, network: "amoy" = "amoy") {
  // TODO: Use DaoFactoryAbi, DaoFactory address
}
// Get DAO metadata (name, symbol, modules, etc.)
export async function getDaoMetadata(daoAddress: string, provider: ethers.Provider, network: "amoy" = "amoy") {
  // TODO: Use KernelLogicAbi, daoAddress
}
// Get DAO modules (list of module addresses/types)
export async function getDaoModules(daoAddress: string, provider: ethers.Provider, network: "amoy" = "amoy") {
  // TODO: Use KernelLogicAbi, daoAddress
}
// Get all public DAOs (paginated)
export async function getPublicDaos(offset: number, limit: number, provider: ethers.Provider, network: "amoy" = "amoy") {
  // TODO: Use DaoFactoryAbi, DaoFactory address
}
// Get DAOs by template (paginated)
export async function getDaosByTemplate(templateId: string, offset: number, limit: number, provider: ethers.Provider, network: "amoy" = "amoy") {
  // TODO: Use DaoFactoryAbi, DaoFactory address
}
// Get DAOs by creator (paginated)
export async function getDaosByCreator(creatorAddress: string, offset: number, limit: number, provider: ethers.Provider, network: "amoy" = "amoy") {
  // TODO: Use DaoFactoryAbi, DaoFactory address
}

// 2. Members
// ==========
// Get all members of a DAO
export async function getMembers(daoAddress: string, provider: ethers.Provider, network: "amoy" = "amoy") {
  // TODO: Use MemberLogicAbi, daoAddress
}
// Get member status (isMember, role, etc.)
export async function getMemberStatus(daoAddress: string, memberAddress: string, provider: ethers.Provider, network: "amoy" = "amoy") {
  // TODO: Use MemberLogicAbi, daoAddress
}
// Get join requests
export async function getJoinRequests(daoAddress: string, provider: ethers.Provider, network: "amoy" = "amoy") {
  // TODO: Use MemberLogicAbi, daoAddress
}
// Get join request status for a user
export async function getJoinRequestStatus(daoAddress: string, userAddress: string, provider: ethers.Provider, network: "amoy" = "amoy") {
  // TODO: Use MemberLogicAbi, daoAddress
}
// Get member count for a DAO
export async function getMemberCount(daoAddress: string, provider: ethers.Provider, network: "amoy" = "amoy") {
  // TODO: Use MemberLogicAbi, daoAddress
}

// 3. Proposals
// ============
// Get all proposals for a DAO
export async function getProposals(daoAddress: string, provider: ethers.Provider, network: "amoy" = "amoy") {
  // TODO: Use ProposalLogicAbi, daoAddress
}
// Get proposal details
export async function getProposalDetails(daoAddress: string, proposalId: string | number, provider: ethers.Provider, network: "amoy" = "amoy") {
  // TODO: Use ProposalLogicAbi, daoAddress
}
// Get proposal count for a DAO
export async function getProposalCount(daoAddress: string, provider: ethers.Provider, network: "amoy" = "amoy") {
  // TODO: Use ProposalLogicAbi, daoAddress
}

// 4. Claims
// =========
// Get all claims for a DAO
export async function getClaims(daoAddress: string, provider: ethers.Provider, network: "amoy" = "amoy") {
  // TODO: Use ClaimLogicAbi, daoAddress
}
// Get claim details
export async function getClaimDetails(daoAddress: string, claimId: string | number, provider: ethers.Provider, network: "amoy" = "amoy") {
  // TODO: Use ClaimLogicAbi, daoAddress
}
// Get claim count for a DAO
export async function getClaimCount(daoAddress: string, provider: ethers.Provider, network: "amoy" = "amoy") {
  // TODO: Use ClaimLogicAbi, daoAddress
}

// 5. Treasury
// ===========
// Get treasury balance for a DAO
export async function getTreasuryBalance(daoAddress: string, provider: ethers.Provider, network: "amoy" = "amoy") {
  // TODO: Use TreasuryLogicAbi, daoAddress
}
// Get token balance for a member
export async function getMemberTokenBalance(daoAddress: string, memberAddress: string, provider: ethers.Provider, network: "amoy" = "amoy") {
  // TODO: Use TokenAbi, Token address
}

// 6. Module Registry
// ==================
// Get all registered modules
export async function getAllRegisteredModules(provider: ethers.Provider, network: "amoy" = "amoy") {
  // TODO: Use ModuleRegistryAbi, ModuleRegistry address
}
// Get module address by name
export async function getModuleAddressByName(moduleName: string, provider: ethers.Provider, network: "amoy" = "amoy") {
  // TODO: Use ModuleRegistryAbi, ModuleRegistry address
}

// 7. Utility/Meta
// ===============
// Get DAO token address
export async function getDaoTokenAddress(daoAddress: string, provider: ethers.Provider, network: "amoy" = "amoy") {
  // TODO: Use KernelLogicAbi, daoAddress
}
// Get DAO owner
export async function getDaoOwner(daoAddress: string, provider: ethers.Provider, network: "amoy" = "amoy") {
  // TODO: Use KernelLogicAbi, daoAddress
}

// Add more as needed for your use cases! 