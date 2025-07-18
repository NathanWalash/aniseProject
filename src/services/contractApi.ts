// contractApi.ts: Provides frontend API functions for interacting with smart contracts (DAOs, modules, tokens, etc.)
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
import DaoFactoryAbiJson from "./abis/DaoFactory.json";
import DaoKernelAbiJson from "./abis/DaoKernel.json";
import MemberModuleAbiJson from "./abis/MemberModule.json";
import ProposalVotingModuleAbiJson from "./abis/ProposalVotingModule.json";
import ClaimVotingModuleAbiJson from "./abis/ClaimVotingModule.json";
import TreasuryModuleAbiJson from "./abis/TreasuryModule.json";
import ModuleRegistryAbiJson from "./abis/ModuleRegistry.json";
import TokenAbiJson from "./abis/Token.json";
const DaoFactoryAbi = DaoFactoryAbiJson.abi || DaoFactoryAbiJson;
const DaoKernelAbi = DaoKernelAbiJson.abi || DaoKernelAbiJson;
const MemberModuleAbi = MemberModuleAbiJson.abi || MemberModuleAbiJson;
const ProposalVotingModuleAbi = ProposalVotingModuleAbiJson.abi || ProposalVotingModuleAbiJson;
const ClaimVotingModuleAbi = ClaimVotingModuleAbiJson.abi || ClaimVotingModuleAbiJson;
const TreasuryModuleAbi = TreasuryModuleAbiJson.abi || TreasuryModuleAbiJson;
const ModuleRegistryAbi = ModuleRegistryAbiJson.abi || ModuleRegistryAbiJson;
const TokenAbi = TokenAbiJson.abi || TokenAbiJson;

/**
 * List all DAOs (paginated if needed)
 */
export async function getAllDaos(provider: ethers.Provider, network: "amoy" = "amoy") {
  const address = getContractAddress("DaoFactory", network);
  const contract = new ethers.Contract(address, DaoFactoryAbi, provider);
  const count = await contract.getDaoCount();
  const daos = [];
  for (let i = 0; i < count; i++) {
    const info = await contract.getDaoInfo(i);
    daos.push(info);
  }
  return daos;
}

/**
 * Get metadata/config for a specific DAO
 */
export async function getDaoMetadata(daoAddress: string, provider: ethers.Provider, network: "amoy" = "amoy") {
  const factoryAddress = getContractAddress("DaoFactory", network);
  const factoryContract = new ethers.Contract(factoryAddress, DaoFactoryAbi, provider);
  try {
    const info = await factoryContract.getDaoInfoByAddress(daoAddress);
    return info;
  } catch (err) {
    let msg = "";
    if (err && typeof err === "object" && "message" in err) {
      msg = (err as any).message;
    } else {
      msg = String(err);
    }
    throw new Error("DAO not found or error: " + msg);
  }
}

/**
 * Get module addresses/types for a DAO (from kernel)
 */
export async function getDaoModules(daoAddress: string, provider: ethers.Provider) {
  const contract = new ethers.Contract(daoAddress, DaoKernelAbi, provider);
  return await contract.modules();
}

/**
 * List public DAOs (paginated)
 */
export async function getPublicDaos(offset: number, limit: number, provider: ethers.Provider, network: "amoy" = "amoy") {
  const address = getContractAddress("DaoFactory", network);
  const contract = new ethers.Contract(address, DaoFactoryAbi, provider);
  const [daos, total] = await contract.getPublicDaosPaginated(offset, limit);
  return { daos, total };
}

/**
 * List DAOs by template (paginated)
 */
export async function getDaosByTemplate(templateId: string, offset: number, limit: number, provider: ethers.Provider, network: "amoy" = "amoy") {
  const address = getContractAddress("DaoFactory", network);
  const contract = new ethers.Contract(address, DaoFactoryAbi, provider);
  const [daos, total] = await contract.getDaosByTemplatePaginated(templateId, offset, limit);
  return { daos, total };
}

/**
 * List DAOs by creator (paginated)
 */
export async function getDaosByCreator(creatorAddress: string, offset: number, limit: number, provider: ethers.Provider, network: "amoy" = "amoy") {
  const address = getContractAddress("DaoFactory", network);
  const contract = new ethers.Contract(address, DaoFactoryAbi, provider);
  const [daos, total] = await contract.getDaosByCreatorPaginated(creatorAddress, offset, limit);
  return { daos, total };
}

/**
 * List all members of a DAO (paginated)
 * @param memberModuleAddress The address of the MemberModule for the DAO
 */
export async function getMembers(memberModuleAddress: string, offset: number, limit: number, provider: ethers.Provider) {
  const contract = new ethers.Contract(memberModuleAddress, MemberModuleAbi, provider);
  const [members, total] = await contract.getMembersPaginated(offset, limit);
  return { members, total };
}

/**
 * Get total number of members in a DAO
 */
export async function getMemberCount(memberModuleAddress: string, provider: ethers.Provider) {
  const contract = new ethers.Contract(memberModuleAddress, MemberModuleAbi, provider);
  return await contract.getMemberCount();
}

/**
 * Get the role of a member in a DAO
 */
export async function getMemberRole(memberModuleAddress: string, userAddress: string, provider: ethers.Provider) {
  const contract = new ethers.Contract(memberModuleAddress, MemberModuleAbi, provider);
  return await contract.getRole(userAddress);
}

/**
 * List join requests (paginated)
 */
export async function getJoinRequests(memberModuleAddress: string, offset: number, limit: number, provider: ethers.Provider) {
  const contract = new ethers.Contract(memberModuleAddress, MemberModuleAbi, provider);
  const [requests, total] = await contract.getJoinRequestsPaginated(offset, limit);
  return { requests, total };
}

/**
 * Get total number of join requests
 */
export async function getJoinRequestCount(memberModuleAddress: string, provider: ethers.Provider) {
  const contract = new ethers.Contract(memberModuleAddress, MemberModuleAbi, provider);
  return await contract.getJoinRequestCount();
}

/**
 * Check if a user has a pending join request
 */
export async function getJoinRequestStatus(memberModuleAddress: string, userAddress: string, provider: ethers.Provider) {
  const contract = new ethers.Contract(memberModuleAddress, MemberModuleAbi, provider);
  return await contract.joinRequests(userAddress);
}

/**
 * List all proposals (paginated)
 * @param proposalModuleAddress The address of the ProposalVotingModule for the DAO
 */
export async function getProposals(proposalModuleAddress: string, offset: number, limit: number, provider: ethers.Provider) {
  const contract = new ethers.Contract(proposalModuleAddress, ProposalVotingModuleAbi, provider);
  const [proposals, total] = await contract.getProposalsPaginated(offset, limit);
  return { proposals, total };
}

/**
 * Get total number of proposals
 */
export async function getProposalCount(proposalModuleAddress: string, provider: ethers.Provider) {
  const contract = new ethers.Contract(proposalModuleAddress, ProposalVotingModuleAbi, provider);
  return await contract.getProposalCount();
}

/**
 * Get details for a specific proposal
 */
export async function getProposalDetails(proposalModuleAddress: string, proposalId: number, provider: ethers.Provider) {
  const contract = new ethers.Contract(proposalModuleAddress, ProposalVotingModuleAbi, provider);
  return await contract.getProposal(proposalId);
}

/**
 * List all claims (paginated)
 * @param claimModuleAddress The address of the ClaimVotingModule for the DAO
 */
export async function getClaims(claimModuleAddress: string, offset: number, limit: number, provider: ethers.Provider) {
  const contract = new ethers.Contract(claimModuleAddress, ClaimVotingModuleAbi, provider);
  const [claims, total] = await contract.getClaimsPaginated(offset, limit);
  return { claims, total };
}

/**
 * Get total number of claims
 */
export async function getClaimCount(claimModuleAddress: string, provider: ethers.Provider) {
  const contract = new ethers.Contract(claimModuleAddress, ClaimVotingModuleAbi, provider);
  return await contract.getClaimCount();
}

/**
 * Get details for a specific claim
 */
export async function getClaimDetails(claimModuleAddress: string, claimId: number, provider: ethers.Provider) {
  const contract = new ethers.Contract(claimModuleAddress, ClaimVotingModuleAbi, provider);
  return await contract.getClaim(claimId);
}

/**
 * Get DAO treasury token balance
 */
export async function getTreasuryBalance(treasuryModuleAddress: string, provider: ethers.Provider) {
  const contract = new ethers.Contract(treasuryModuleAddress, TreasuryModuleAbi, provider);
  return await contract.getTokenBalance();
}

/**
 * Get a member's token balance (from ERC20 token contract)
 */
export async function getMemberTokenBalance(tokenAddress: string, memberAddress: string, provider: ethers.Provider) {
  const contract = new ethers.Contract(tokenAddress, TokenAbi, provider);
  return await contract.balanceOf(memberAddress);
}

/**
 * List all registered modules (ModuleRegistry)
 */
export async function getAllRegisteredModules(moduleRegistryAddress: string, provider: ethers.Provider) {
  const contract = new ethers.Contract(moduleRegistryAddress, ModuleRegistryAbi, provider);
  // Assuming a function getAllModules() exists; if not, adjust as needed
  return await contract.getAllModules();
}

/**
 * Get module address by name (ModuleRegistry)
 */
export async function getModuleAddressByName(moduleRegistryAddress: string, moduleName: string, provider: ethers.Provider) {
  const contract = new ethers.Contract(moduleRegistryAddress, ModuleRegistryAbi, provider);
  return await contract.getModuleAddressByName(moduleName);
}

/**
 * Get the token address for a DAO (from kernel/treasury)
 */
export async function getDaoTokenAddress(treasuryModuleAddress: string, provider: ethers.Provider) {
  const contract = new ethers.Contract(treasuryModuleAddress, TreasuryModuleAbi, provider);
  return await contract.token();
}

/**
 * Get the owner address for a DAO (from kernel)
 */
export async function getDaoOwner(daoAddress: string, provider: ethers.Provider) {
  const contract = new ethers.Contract(daoAddress, DaoKernelAbi, provider);
  return await contract.owner();
}

/**
 * Get the treasury module address for a DAO (from kernel)
 */
export async function getTreasuryModuleAddress(daoAddress: string, provider: ethers.Provider) {
  const contract = new ethers.Contract(daoAddress, DaoKernelAbi, provider);
  return await contract.getTreasuryModule();
} 