import React, { useState } from 'react';
import { View, Button, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, Clipboard } from 'react-native';
import { getCounterValue, incrementCounter, decrementCounter } from '../../services/contractService';
import {
  getAllDaos, getDaoMetadata, getDaoModules, getPublicDaos, getDaosByTemplate, getDaosByCreator,
  getMembers, getMemberCount, getMemberRole, getJoinRequests, getJoinRequestCount, getJoinRequestStatus,
  getProposals, getProposalCount, getProposalDetails,
  getClaims, getClaimCount, getClaimDetails,
  getTreasuryBalance, getMemberTokenBalance,
  getAllRegisteredModules, getModuleAddressByName,
  getDaoTokenAddress, getDaoOwner, getTreasuryModuleAddress
} from "../../services/contractApi";
import { ethers } from "ethers";
import { AMOY_RPC_URL } from "../../utils/rpc";
import { safeStringify } from "../../utils/safeStringify";
import { useRef } from "react";

// Utility: Recursively convert BigInt values to strings for safe JSON serialization
function bigIntToString(obj: any): any {
  if (typeof obj === 'bigint') return obj.toString();
  if (Array.isArray(obj)) return obj.map(bigIntToString);
  if (obj && typeof obj === 'object') {
    const res: any = {};
    for (const k in obj) res[k] = bigIntToString(obj[k]);
    return res;
  }
  return obj;
}

export default function DebugScreen() {
// DebugScreen: A developer utility screen for testing and debugging contract API endpoints and state
// State hooks for counter demo (example contract interaction)
const [counter, setCounter] = useState<number | null>(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

// State hooks for DAOs, Members, Proposals, Claims, Treasury, Token, Module Registry, Utility/Meta
// Each section below manages its own state for loading, error, and data
const [daos, setDaos] = useState<any[]>([]);
const [daoLoading, setDaoLoading] = useState(false);
const [daoError, setDaoError] = useState("");

const [daoAddress, setDaoAddress] = useState("");
const [daoMeta, setDaoMeta] = useState<any | null>(null);
const [metaLoading, setMetaLoading] = useState(false);
const [metaError, setMetaError] = useState("");

// DAO
const [daoModules, setDaoModules] = useState<any[]>([]);
const [daoModulesLoading, setDaoModulesLoading] = useState(false);
const [daoModulesError, setDaoModulesError] = useState("");
const [publicDaos, setPublicDaos] = useState<any[]>([]);
const [publicDaosTotal, setPublicDaosTotal] = useState<number | null>(null);
const [publicDaosLoading, setPublicDaosLoading] = useState(false);
const [publicDaosError, setPublicDaosError] = useState("");
const [publicOffset, setPublicOffset] = useState("0");
const [publicLimit, setPublicLimit] = useState("10");
// Members
const [members, setMembers] = useState<any[]>([]);
const [membersTotal, setMembersTotal] = useState<number | null>(null);
const [membersLoading, setMembersLoading] = useState(false);
const [membersError, setMembersError] = useState("");
const [membersOffset, setMembersOffset] = useState("0");
const [membersLimit, setMembersLimit] = useState("10");
const [memberCount, setMemberCount] = useState<number | null>(null);
const [memberCountLoading, setMemberCountLoading] = useState(false);
const [memberCountError, setMemberCountError] = useState("");
const [memberRoleAddress, setMemberRoleAddress] = useState("");
const [memberRole, setMemberRole] = useState<any | null>(null);
const [memberRoleLoading, setMemberRoleLoading] = useState(false);
const [memberRoleError, setMemberRoleError] = useState("");
const [joinRequests, setJoinRequests] = useState<any[]>([]);
const [joinRequestsTotal, setJoinRequestsTotal] = useState<number | null>(null);
const [joinRequestsLoading, setJoinRequestsLoading] = useState(false);
const [joinRequestsError, setJoinRequestsError] = useState("");
const [joinRequestsOffset, setJoinRequestsOffset] = useState("0");
const [joinRequestsLimit, setJoinRequestsLimit] = useState("10");
const [joinRequestCount, setJoinRequestCount] = useState<number | null>(null);
const [joinRequestCountLoading, setJoinRequestCountLoading] = useState(false);
const [joinRequestCountError, setJoinRequestCountError] = useState("");
const [joinRequestStatusAddress, setJoinRequestStatusAddress] = useState("");
const [joinRequestStatus, setJoinRequestStatus] = useState<any | null>(null);
const [joinRequestStatusLoading, setJoinRequestStatusLoading] = useState(false);
const [joinRequestStatusError, setJoinRequestStatusError] = useState("");
// Proposals
const [proposals, setProposals] = useState<any[]>([]);
const [proposalsTotal, setProposalsTotal] = useState<number | null>(null);
const [proposalsLoading, setProposalsLoading] = useState(false);
const [proposalsError, setProposalsError] = useState("");
const [proposalsOffset, setProposalsOffset] = useState("0");
const [proposalsLimit, setProposalsLimit] = useState("10");
const [proposalCount, setProposalCount] = useState<number | null>(null);
const [proposalCountLoading, setProposalCountLoading] = useState(false);
const [proposalCountError, setProposalCountError] = useState("");
const [proposalId, setProposalId] = useState("");
const [proposalDetails, setProposalDetails] = useState<any | null>(null);
const [proposalDetailsLoading, setProposalDetailsLoading] = useState(false);
const [proposalDetailsError, setProposalDetailsError] = useState("");
// Claims
const [claims, setClaims] = useState<any[]>([]);
const [claimsTotal, setClaimsTotal] = useState<number | null>(null);
const [claimsLoading, setClaimsLoading] = useState(false);
const [claimsError, setClaimsError] = useState("");
const [claimsOffset, setClaimsOffset] = useState("0");
const [claimsLimit, setClaimsLimit] = useState("10");
const [claimCount, setClaimCount] = useState<number | null>(null);
const [claimCountLoading, setClaimCountLoading] = useState(false);
const [claimCountError, setClaimCountError] = useState("");
const [claimId, setClaimId] = useState("");
const [claimDetails, setClaimDetails] = useState<any | null>(null);
const [claimDetailsLoading, setClaimDetailsLoading] = useState(false);
const [claimDetailsError, setClaimDetailsError] = useState("");
// Treasury
const [treasuryBalance, setTreasuryBalance] = useState<any | null>(null);
const [treasuryBalanceLoading, setTreasuryBalanceLoading] = useState(false);
const [treasuryBalanceError, setTreasuryBalanceError] = useState("");
// Token
const [tokenAddress, setTokenAddress] = useState("");
const [tokenBalanceAddress, setTokenBalanceAddress] = useState("");
const [tokenBalance, setTokenBalance] = useState<any | null>(null);
const [tokenBalanceLoading, setTokenBalanceLoading] = useState(false);
const [tokenBalanceError, setTokenBalanceError] = useState("");
// Module Registry
const [allModules, setAllModules] = useState<any | null>(null);
const [allModulesLoading, setAllModulesLoading] = useState(false);
const [allModulesError, setAllModulesError] = useState("");
const [moduleName, setModuleName] = useState("");
const [moduleAddressByName, setModuleAddressByName] = useState<any | null>(null);
const [moduleAddressByNameLoading, setModuleAddressByNameLoading] = useState(false);
const [moduleAddressByNameError, setModuleAddressByNameError] = useState("");
// Utility/Meta
const [daoTokenAddress, setDaoTokenAddress] = useState<any | null>(null);
const [daoTokenAddressLoading, setDaoTokenAddressLoading] = useState(false);
const [daoTokenAddressError, setDaoTokenAddressError] = useState("");
const [daoOwner, setDaoOwner] = useState<any | null>(null);
const [daoOwnerLoading, setDaoOwnerLoading] = useState(false);
const [daoOwnerError, setDaoOwnerError] = useState("");

// Collapsible section state for UI navigation
const [openSection, setOpenSection] = useState<string | null>(null);
const toggleSection = (section: string) => {
  setOpenSection(openSection === section ? null : section);
};

// Debug log state and helper to add logs to the debug area
const [debugLogs, setDebugLogs] = useState<string[]>([]);
function addDebugLog(msg: string) {
  setDebugLogs(logs => [msg, ...logs.slice(0, 19)]); // keep last 20 logs
}

// Helper to identify module type by calling getSelectors() and matching known selectors
async function identifyModuleType(moduleAddress: string, provider: ethers.Provider): Promise<string> {
  // Try to call getSelectors() and match known selectors
  try {
    const contract = new ethers.Contract(moduleAddress, [
      "function getSelectors() view returns (bytes4[])",
    ], provider);
    const selectors: string[] = await contract.getSelectors();
    if (selectors.some(sel => sel === '0x8da5cb5b')) return 'MemberModule';
    if (selectors.some(sel => sel === '0x485cc955')) return 'ProposalModule';
    if (selectors.some(sel => sel === '0x158ef93e')) return 'ClaimModule';
    if (selectors.some(sel => sel === '0x6215be77')) return 'TreasuryModule';
    return 'UnknownModule';
  } catch (e) {
    return 'UnknownModule';
  }
}

// When a DAO is selected, fetch its modules and try to identify them
async function handleUseDao(dao: any) {
  setDaoAddress(dao.dao || dao.address || "");
  setOpenSection('DAOs');
  addDebugLog(`Selected DAO: ${dao.dao || dao.address || ""}`);
  try {
    const modules = await getDaoModules(dao.dao || dao.address || "", provider);
    addDebugLog(`Modules for DAO: ${JSON.stringify(modules)}`);
    setDaoModules(modules);
    // No auto-population or cross-field state setting
  } catch (e: any) {
    addDebugLog(`Error fetching modules for DAO: ${e.message || String(e)}`);
  }
}

// Provider for all contract calls (Amoy testnet)
const provider = new ethers.JsonRpcProvider(AMOY_RPC_URL);
const daoAddressInputRef = useRef<TextInput>(null);

// Handlers for counter demo (get, increment, decrement)
const handleGet = async () => {
  setLoading(true);
  setError(null);
  try {
    console.log('[DebugScreen] handleGet called');
    const value = await getCounterValue();
    setCounter(value);
    console.log('[DebugScreen] getCounterValue returned', value);
  } catch (e: any) {
    setError(e.message || 'Error fetching counter');
    console.log('[DebugScreen] handleGet error', e);
  } finally {
    setLoading(false);
    console.log('[DebugScreen] handleGet finished');
  }
};

const handleIncrement = async () => {
  setLoading(true);
  setError(null);
  try {
    console.log('[DebugScreen] handleIncrement called');
    await incrementCounter();
    await handleGet();
    console.log('[DebugScreen] incrementCounter finished');
  } catch (e: any) {
    setError(e.message || 'Error incrementing counter');
    console.log('[DebugScreen] handleIncrement error', e);
  } finally {
    setLoading(false);
    console.log('[DebugScreen] handleIncrement finished');
  }
};

const handleDecrement = async () => {
  setLoading(true);
  setError(null);
  try {
    console.log('[DebugScreen] handleDecrement called');
    await decrementCounter();
    await handleGet();
    console.log('[DebugScreen] decrementCounter finished');
  } catch (e: any) {
    setError(e.message || 'Error decrementing counter');
    console.log('[DebugScreen] handleDecrement error', e);
  } finally {
    setLoading(false);
    console.log('[DebugScreen] handleDecrement finished');
  }
};

// Handlers for DAO endpoints (get all DAOs, get metadata, get modules, get public DAOs)
const handleGetAllDaos = async () => {
  setDaoLoading(true);
  setDaoError("");
  setDaos([]);
  try {
    const result = await getAllDaos(provider);
    setDaos(result);
  } catch (e: any) {
    setDaoError(e.message || String(e));
  } finally {
    setDaoLoading(false);
  }
};

const handleGetDaoMetadata = async () => {
  setMetaLoading(true);
  setMetaError("");
  setDaoMeta(null);
  try {
    const result = await getDaoMetadata(daoAddress, provider);
    setDaoMeta(result);
  } catch (e: any) {
    setMetaError(e.message || String(e));
  } finally {
    setMetaLoading(false);
  }
};

// Handlers for new endpoints
// DAO Modules
const handleGetDaoModules = async () => {
  setDaoModulesLoading(true);
  setDaoModulesError("");
  setDaoModules([]);
  try {
    const result = await getDaoModules(daoAddress, provider);
    addDebugLog(`getDaoModules result: ${JSON.stringify(result)}`);
    setDaoModules(result);
  } catch (e: any) {
    setDaoModulesError(e.message || String(e));
    addDebugLog(`getDaoModules error: ${e.message || String(e)}`);
  } finally {
    setDaoModulesLoading(false);
  }
};
// Public DAOs
const handleGetPublicDaos = async () => {
  setPublicDaosLoading(true);
  setPublicDaosError("");
  setPublicDaos([]);
  try {
    const { daos, total } = await getPublicDaos(
      parseInt(publicOffset, 10),
      parseInt(publicLimit, 10),
      provider
    );
    addDebugLog(`getPublicDaos result: ${JSON.stringify(bigIntToString({ daos, total }))}`);
    if (!Array.isArray(daos)) {
      setPublicDaosError('No DAOs returned or contract call failed.');
      setPublicDaos([]);
      setPublicDaosTotal(0);
      return;
    }
    setPublicDaos(daos);
    setPublicDaosTotal(total);
  } catch (e: any) {
    setPublicDaosError(e.message || String(e));
    addDebugLog(`getPublicDaos error: ${e.message || String(e)}`);
  } finally {
    setPublicDaosLoading(false);
  }
};

// UI helper components for copy/paste/debug buttons
function UseButton({ label, onPress }: { label: string, onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={{ marginLeft: 8, backgroundColor: '#eee', padding: 4, borderRadius: 4 }}>
      <Text style={{ color: '#007AFF', fontSize: 12 }}>{label}</Text>
    </TouchableOpacity>
  );
}

const [clipboardBuffer, setClipboardBuffer] = useState("");

function CopyButton({ value }: { value: string }) {
  return (
    <TouchableOpacity onPress={() => setClipboardBuffer(value)} style={{ marginLeft: 8, backgroundColor: '#e0e0e0', padding: 4, borderRadius: 4 }}>
      <Text style={{ color: '#333', fontSize: 12 }}>Copy</Text>
    </TouchableOpacity>
  );
}
function PasteButton({ onPaste }: { onPaste: (val: string) => void }) {
  return (
    <TouchableOpacity onPress={() => onPaste(clipboardBuffer)} style={{ marginLeft: 8, backgroundColor: '#e0e0ff', padding: 4, borderRadius: 4 }}>
      <Text style={{ color: '#007AFF', fontSize: 12 }}>Paste</Text>
    </TouchableOpacity>
  );
}
function DebugButton({ label, value }: { label: string, value: any }) {
  return (
    <TouchableOpacity onPress={() => { console.log(`[DEBUG] ${label}:`, value); addDebugLog(`[DEBUG] ${label}: ${JSON.stringify(value)}`); }} style={{ marginLeft: 8, backgroundColor: '#ffe0e0', padding: 4, borderRadius: 4 }}>
      <Text style={{ color: '#c00', fontSize: 12 }}>Debug</Text>
    </TouchableOpacity>
  );
}
// Members
const handleGetMembers = async () => {
  setMembersLoading(true);
  setMembersError("");
  setMembers([]);
  try {
    const { members, total } = await getMembers(
      membersDaoAddress,
      parseInt(membersOffset, 10),
      parseInt(membersLimit, 10),
      provider
    );
    addDebugLog(`getMembers result: ${JSON.stringify(bigIntToString({ members, total }))}`);
    setMembers(members);
    setMembersTotal(total);
  } catch (e: any) {
    setMembersError(e.message || String(e));
    addDebugLog(`getMembers error: ${e.message || String(e)}`);
  } finally {
    setMembersLoading(false);
  }
};
const handleGetMemberCount = async () => {
  setMemberCountLoading(true);
  setMemberCountError("");
  setMemberCount(null);
  try {
    const count = await getMemberCount(membersDaoAddress, provider);
    addDebugLog(`getMemberCount result: ${JSON.stringify(bigIntToString({ count }))}`);
    setMemberCount(count);
  } catch (e: any) {
    setMemberCountError(e.message || String(e));
    addDebugLog(`getMemberCount error: ${e.message || String(e)}`);
  } finally {
    setMemberCountLoading(false);
  }
};
const handleGetMemberRole = async () => {
  setMemberRoleLoading(true);
  setMemberRoleError("");
  setMemberRole(null);
  try {
    const role = await getMemberRole(membersDaoAddress, memberRoleAddress, provider);
    addDebugLog(`getMemberRole result: ${JSON.stringify(bigIntToString({ role }))}`);
    setMemberRole(role);
  } catch (e: any) {
    setMemberRoleError(e.message || String(e));
    addDebugLog(`getMemberRole error: ${e.message || String(e)}`);
  } finally {
    setMemberRoleLoading(false);
  }
};
const handleGetJoinRequests = async () => {
  setJoinRequestsLoading(true);
  setJoinRequestsError("");
  setJoinRequests([]);
  try {
    const { requests, total } = await getJoinRequests(
      membersDaoAddress,
      parseInt(joinRequestsOffset, 10),
      parseInt(joinRequestsLimit, 10),
      provider
    );
    addDebugLog(`getJoinRequests result: ${JSON.stringify(bigIntToString({ requests, total }))}`);
    setJoinRequests(requests);
    setJoinRequestsTotal(total);
  } catch (e: any) {
    setJoinRequestsError(e.message || String(e));
    addDebugLog(`getJoinRequests error: ${e.message || String(e)}`);
  } finally {
    setJoinRequestsLoading(false);
  }
};
const handleGetJoinRequestCount = async () => {
  setJoinRequestCountLoading(true);
  setJoinRequestCountError("");
  setJoinRequestCount(null);
  try {
    const count = await getJoinRequestCount(membersDaoAddress, provider);
    addDebugLog(`getJoinRequestCount result: ${JSON.stringify(bigIntToString({ count }))}`);
    setJoinRequestCount(count);
  } catch (e: any) {
    setJoinRequestCountError(e.message || String(e));
    addDebugLog(`getJoinRequestCount error: ${e.message || String(e)}`);
  } finally {
    setJoinRequestCountLoading(false);
  }
};
const handleGetJoinRequestStatus = async () => {
  setJoinRequestStatusLoading(true);
  setJoinRequestStatusError("");
  setJoinRequestStatus(null);
  try {
    const status = await getJoinRequestStatus(membersDaoAddress, joinRequestStatusAddress, provider);
    addDebugLog(`getJoinRequestStatus result: ${JSON.stringify(bigIntToString({ status }))}`);
    setJoinRequestStatus(status);
  } catch (e: any) {
    setJoinRequestStatusError(e.message || String(e));
    addDebugLog(`getJoinRequestStatus error: ${e.message || String(e)}`);
  } finally {
    setJoinRequestStatusLoading(false);
  } 
};

// Proposals
const handleGetProposals = async () => {
  setProposalsLoading(true);
  setProposalsError("");
  setProposals([]);
  try {
    const { proposals, total } = await getProposals(
      proposalsDaoAddress,
      parseInt(proposalsOffset, 10),
      parseInt(proposalsLimit, 10),
      provider
    );
    addDebugLog(`getProposals result: ${JSON.stringify(bigIntToString({ proposals, total }))}`);
    setProposals(proposals);
    setProposalsTotal(total);
  } catch (e: any) {
    setProposalsError(e.message || String(e));
    addDebugLog(`getProposals error: ${e.message || String(e)}`);
  } finally {
    setProposalsLoading(false);
  }
};
const handleGetProposalCount = async () => {
  setProposalCountLoading(true);
  setProposalCountError("");
  setProposalCount(null);
  try {
    const count = await getProposalCount(proposalsDaoAddress, provider);
    addDebugLog(`getProposalCount result: ${JSON.stringify(bigIntToString({ count }))}`);
    setProposalCount(count);
  } catch (e: any) {
    setProposalCountError(e.message || String(e));
    addDebugLog(`getProposalCount error: ${e.message || String(e)}`);
  } finally {
    setProposalCountLoading(false);
  }
};
const handleGetProposalDetails = async () => {
  setProposalDetailsLoading(true);
  setProposalDetailsError("");
  setProposalDetails(null);
  try {
    const details = await getProposalDetails(proposalsDaoAddress, parseInt(proposalId, 10), provider);
    addDebugLog(`getProposalDetails result: ${JSON.stringify(bigIntToString(details))}`);
    setProposalDetails(details);
  } catch (e: any) {
    setProposalDetailsError(e.message || String(e));
    addDebugLog(`getProposalDetails error: ${e.message || String(e)}`);
  } finally {
    setProposalDetailsLoading(false);
  }
};

// Claims
const handleGetClaims = async () => {
  setClaimsLoading(true);
  setClaimsError("");
  setClaims([]);
  try {
    const { claims, total } = await getClaims(
      claimsDaoAddress,
      parseInt(claimsOffset, 10),
      parseInt(claimsLimit, 10),
      provider
    );
    addDebugLog(`getClaims result: ${JSON.stringify(bigIntToString({ claims, total }))}`);
    setClaims(claims);
    setClaimsTotal(total);
  } catch (e: any) {
    setClaimsError(e.message || String(e));
    addDebugLog(`getClaims error: ${e.message || String(e)}`);
  } finally {
    setClaimsLoading(false);
  }
};
const handleGetClaimCount = async () => {
  setClaimCountLoading(true);
  setClaimCountError("");
  setClaimCount(null);
  try {
    const count = await getClaimCount(claimsDaoAddress, provider);
    addDebugLog(`getClaimCount result: ${JSON.stringify(bigIntToString({ count }))}`);
    setClaimCount(count);
  } catch (e: any) {
    setClaimCountError(e.message || String(e));
    addDebugLog(`getClaimCount error: ${e.message || String(e)}`);
  } finally {
    setClaimCountLoading(false);
  }
};
const handleGetClaimDetails = async () => {
  setClaimDetailsLoading(true);
  setClaimDetailsError("");
  setClaimDetails(null);
  try {
    const details = await getClaimDetails(claimsDaoAddress, parseInt(claimId, 10), provider);
    addDebugLog(`getClaimDetails result: ${JSON.stringify(bigIntToString(details))}`);
    setClaimDetails(details);
  } catch (e: any) {
    setClaimDetailsError(e.message || String(e));
    addDebugLog(`getClaimDetails error: ${e.message || String(e)}`);
  } finally {
    setClaimDetailsLoading(false);
  }
};

// Treasury
const handleGetTreasuryBalance = async () => {
  setTreasuryBalanceLoading(true);
  setTreasuryBalanceError("");
  setTreasuryBalance(null);
  try {
    const balance = await getTreasuryBalance(treasuryModuleInput, provider);
    addDebugLog(`getTreasuryBalance result: ${JSON.stringify(bigIntToString({ balance }))}`);
    setTreasuryBalance(balance);
  } catch (e: any) {
    setTreasuryBalanceError(e.message || String(e));
    addDebugLog(`getTreasuryBalance error: ${e.message || String(e)}`);
  } finally {
    setTreasuryBalanceLoading(false);
  }
};

// Token
const handleGetMemberTokenBalance = async () => {
  setTokenBalanceLoading(true);
  setTokenBalanceError("");
  setTokenBalance(null);
  try {
    const balance = await getMemberTokenBalance(tokenInput, tokenBalanceAddress, provider);
    addDebugLog(`getMemberTokenBalance result: ${JSON.stringify(bigIntToString({ balance }))}`);
    setTokenBalance(balance);
  } catch (e: any) {
    setTokenBalanceError(e.message || String(e));
    addDebugLog(`getMemberTokenBalance error: ${e.message || String(e)}`);
  } finally {
    setTokenBalanceLoading(false);
  }
};

// Module Registry
const handleGetAllRegisteredModules = async () => {
  setAllModulesLoading(true);
  setAllModulesError("");
  setAllModules(null);
  try {
    const modules = await getAllRegisteredModules(moduleRegistryInput, provider);
    addDebugLog(`getAllRegisteredModules result: ${JSON.stringify(modules)}`);
    setAllModules(modules);
  } catch (e: any) {
    setAllModulesError(e.message || String(e));
    addDebugLog(`getAllRegisteredModules error: ${e.message || String(e)}`);
  } finally {
    setAllModulesLoading(false);
  }
};
const handleGetModuleAddressByName = async () => {
  setModuleAddressByNameLoading(true);
  setModuleAddressByNameError("");
  setModuleAddressByName(null);
  try {
    const address = await getModuleAddressByName(moduleRegistryInput, moduleName, provider);
    addDebugLog(`getModuleAddressByName result: ${JSON.stringify(bigIntToString({ address }))}`);
    setModuleAddressByName(address);
  } catch (e: any) {
    setModuleAddressByNameError(e.message || String(e));
    addDebugLog(`getModuleAddressByName error: ${e.message || String(e)}`);
  } finally {
    setModuleAddressByNameLoading(false);
  }
};

// Utility/Meta
const handleGetDaoTokenAddress = async () => {
  setDaoTokenAddressLoading(true);
  setDaoTokenAddressError("");
  setDaoTokenAddress(null);
  try {
    const address = await getDaoTokenAddress(treasuryForTokenInput, provider);
    addDebugLog(`getDaoTokenAddress result: ${JSON.stringify(bigIntToString({ address }))}`);
    setDaoTokenAddress(address);
  } catch (e: any) {
    setDaoTokenAddressError(e.message || String(e));
    addDebugLog(`getDaoTokenAddress error: ${e.message || String(e)}`);
  } finally {
    setDaoTokenAddressLoading(false);
  }
};
const handleGetDaoOwner = async () => {
  setDaoOwnerLoading(true);
  setDaoOwnerError("");
  setDaoOwner(null);
  try {
    const owner = await getDaoOwner(daoForOwnerInput, provider);
    addDebugLog(`getDaoOwner result: ${JSON.stringify(bigIntToString({ owner }))}`);
    setDaoOwner(owner);
  } catch (e: any) {
    setDaoOwnerError(e.message || String(e));
    addDebugLog(`getDaoOwner error: ${e.message || String(e)}`);
  } finally {
    setDaoOwnerLoading(false);
  }
};
// For Members:

// Remove MemberModule address state and detection logic
// Only use membersDaoAddress for all member queries
const [membersDaoAddress, setMembersDaoAddress] = useState("");
// For Proposals:
const [proposalsDaoAddress, setProposalsDaoAddress] = useState("");
// For Claims:
const [claimsDaoAddress, setClaimsDaoAddress] = useState("");
// For Treasury:
const [treasuryModuleInput, setTreasuryModuleInput] = useState("");
// For Token:
const [tokenInput, setTokenInput] = useState("");
// For Module Registry:
const [moduleRegistryInput, setModuleRegistryInput] = useState("");
// For Utility/Meta:
const [daoForOwnerInput, setDaoForOwnerInput] = useState("");
const [treasuryForTokenInput, setTreasuryForTokenInput] = useState("");

// Treasury Section: Allow input of DAO address, fetch treasury address, and get balance
const [treasuryDaoAddress, setTreasuryDaoAddress] = useState("");
const [treasuryModuleAddress, setTreasuryModuleAddress] = useState("");
const handleGetTreasuryAddressAndBalance = async () => {
  setTreasuryBalanceLoading(true);
  setTreasuryBalanceError("");
  setTreasuryBalance(null);
  setTreasuryModuleAddress("");
  try {
    const treasuryAddr = await getTreasuryModuleAddress(treasuryDaoAddress, provider);
    setTreasuryModuleAddress(treasuryAddr);
    const balance = await getTreasuryBalance(treasuryAddr, provider);
    setTreasuryBalance(balance);
    addDebugLog(`Treasury address: ${treasuryAddr}, balance: ${JSON.stringify(bigIntToString({ balance }))}`);
  } catch (e: any) {
    setTreasuryBalanceError(e.message || String(e));
    addDebugLog(`Treasury error: ${e.message || String(e)}`);
  } finally {
    setTreasuryBalanceLoading(false);
  }
};


// Main render: UI for each section, collapsible, with debug log area at the bottom
return (
  <ScrollView contentContainerStyle={styles.container}>
    {/* Quick Navigation */}
    <Text style={styles.header}>Debug: Quick Navigation</Text>
    {[
      'DAOs', 'Members', 'Proposals', 'Claims', 'Treasury', 'Token', 'Module Registry', 'Utility / Meta'
    ].map(section => (
      <TouchableOpacity key={section} onPress={() => setOpenSection(section)}>
        <Text style={{ color: '#007AFF', marginBottom: 8 }}>{section}</Text>
      </TouchableOpacity>
    ))}
    {/* DAOs Section */}
    <View style={styles.divider} />
    <TouchableOpacity onPress={() => toggleSection('DAOs')}>
      <Text style={styles.header}>{openSection === 'DAOs' ? '▼' : '▶'} DAOs</Text>
    </TouchableOpacity>
    {openSection === 'DAOs' && (
      <View>
        <Button title="Get All DAOs" onPress={handleGetAllDaos} />
        {daoLoading && <Text>Loading DAOs...</Text>}
        {daoError && <Text style={styles.error}>{daoError}</Text>}
        {daos.length > 0 ? (
          <View style={{ marginVertical: 10 }}>
            <Text style={{ fontWeight: "bold", marginBottom: 5 }}>DAOs:</Text>
            {daos.map((dao, idx) => (
              <View key={idx} style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                <Text style={{ fontFamily: "monospace", fontSize: 12, flex: 1 }}>{dao.dao || dao.address || ""}</Text>
                <CopyButton value={dao.dao || dao.address || ""} />
                <DebugButton label="DAO" value={dao} />
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.json}>No DAOs found.</Text>
        )}
        <Text style={styles.label}>DAO Address:</Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TextInput
            ref={daoAddressInputRef}
            style={styles.input}
            value={daoAddress}
            onChangeText={setDaoAddress}
            placeholder="0x..."
            autoCapitalize="none"
            autoCorrect={false}
          />
          <PasteButton onPaste={setDaoAddress} />
        </View>
        <Button title="Get DAO Metadata" onPress={handleGetDaoMetadata} />
        {metaLoading && <Text>Loading metadata...</Text>}
        {metaError && <Text style={styles.error}>{metaError}</Text>}
        {daoMeta && (
          <Text style={styles.json}>{safeStringify(bigIntToString(daoMeta), 2)}</Text>
        )}
        <Button title="Get DAO Modules" onPress={handleGetDaoModules} />
        {daoModulesLoading && <Text>Loading modules...</Text>}
        {daoModulesError && <Text style={styles.error}>{daoModulesError}</Text>}
        {Array.isArray(daoModules) && daoModules.length > 0 ? (
          <View style={{ marginVertical: 10 }}>
            <Text style={{ fontWeight: "bold", marginBottom: 5 }}>Modules:</Text>
            {daoModules.map((mod, idx) => (
              <View key={idx} style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                <Text style={{ fontFamily: "monospace", fontSize: 12, flex: 1 }}>{mod}</Text>
                <CopyButton value={mod} />
                <DebugButton label={`Module ${idx}`} value={mod} />
              </View>
            ))}
          </View>
        ) : daoModulesLoading ? null : (
          <Text style={styles.json}>No modules found or not an array.</Text>
        )}
        <Text style={styles.label}>Public DAOs Pagination:</Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TextInput style={[styles.input, { flex: 1, marginRight: 8 }]} value={publicOffset} onChangeText={setPublicOffset} placeholder="Offset" keyboardType="numeric" />
          <TextInput style={[styles.input, { flex: 1 }]} value={publicLimit} onChangeText={setPublicLimit} placeholder="Limit" keyboardType="numeric" />
        </View>
        <Button title="Get Public DAOs" onPress={handleGetPublicDaos} />
        {publicDaosLoading && <Text>Loading public DAOs...</Text>}
        {publicDaosError && <Text style={styles.error}>{publicDaosError}</Text>}
        {Array.isArray(publicDaos) && publicDaos.length > 0 ? (
          <View style={{ marginVertical: 10 }}>
            <Text style={{ fontWeight: "bold", marginBottom: 5 }}>Public DAOs:</Text>
            {publicDaos.map((dao, idx) => (
              <View key={idx} style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                <Text style={{ fontFamily: "monospace", fontSize: 12, flex: 1 }}>{dao.dao || dao.address || ""}</Text>
                <CopyButton value={dao.dao || dao.address || ""} />
                <DebugButton label="Public DAO" value={dao} />
              </View>
            ))}
          </View>
        ) : publicDaosLoading ? null : (
          <Text style={styles.json}>No public DAOs found or not an array.</Text>
        )}
      </View>
    )}
    {/* Members Section */}
    <View style={styles.divider} />
    <TouchableOpacity onPress={() => toggleSection('Members')}>
      <Text style={styles.header}>{openSection === 'Members' ? '▼' : '▶'} Members</Text>
    </TouchableOpacity>
    {openSection === 'Members' && (
      <View>
        <Text style={styles.label}>DAO Address for Members:</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TextInput style={[styles.input, { flex: 1 }]} value={membersDaoAddress} onChangeText={setMembersDaoAddress} placeholder="0x..." autoCapitalize="none" autoCorrect={false} />
          <PasteButton onPaste={setMembersDaoAddress} />
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TextInput style={[styles.input, { flex: 1, marginRight: 8 }]} value={membersOffset} onChangeText={setMembersOffset} placeholder="Offset" keyboardType="numeric" />
          <TextInput style={[styles.input, { flex: 1 }]} value={membersLimit} onChangeText={setMembersLimit} placeholder="Limit" keyboardType="numeric" />
        </View>
        <Button title="Get Members (Paginated)" onPress={handleGetMembers} />
        {membersLoading && <Text>Loading members...</Text>}
        {membersError && <Text style={styles.error}>{membersError}</Text>}
        {members.length > 0 && (
          <View style={{ marginVertical: 10 }}>
            <Text style={{ fontWeight: "bold", marginBottom: 5 }}>Members:</Text>
            {members.map((addr, idx) => (
              <View key={idx} style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                <Text style={{ fontFamily: "monospace", fontSize: 12, flex: 1 }}>{addr}</Text>
                <CopyButton value={addr} />
              </View>
            ))}
            <Text style={styles.json}>{safeStringify(bigIntToString({ members, total: membersTotal }), 2)}</Text>
          </View>
        )}
        <Button title="Get Member Count" onPress={handleGetMemberCount} />
        {memberCountLoading && <Text>Loading member count...</Text>}
        {memberCountError && <Text style={styles.error}>{memberCountError}</Text>}
        {memberCount !== null && (
          <Text style={styles.json}>{safeStringify(bigIntToString({ memberCount }), 2)}</Text>
        )}
        <Text style={styles.label}>User Address for Role:</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TextInput style={styles.input} value={memberRoleAddress} onChangeText={setMemberRoleAddress} placeholder="0x..." autoCapitalize="none" autoCorrect={false} />
          <PasteButton onPaste={setMemberRoleAddress} />
        </View>
        <Button title="Get Member Role" onPress={handleGetMemberRole} />
        {memberRoleLoading && <Text>Loading member role...</Text>}
        {memberRoleError && <Text style={styles.error}>{memberRoleError}</Text>}
        {memberRole !== null && (
          <Text style={styles.json}>{safeStringify(bigIntToString({ memberRole }), 2)}</Text>
        )}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TextInput style={[styles.input, { flex: 1, marginRight: 8 }]} value={joinRequestsOffset} onChangeText={setJoinRequestsOffset} placeholder="Offset" keyboardType="numeric" />
          <TextInput style={[styles.input, { flex: 1 }]} value={joinRequestsLimit} onChangeText={setJoinRequestsLimit} placeholder="Limit" keyboardType="numeric" />
        </View>
        <Button title="Get Join Requests (Paginated)" onPress={handleGetJoinRequests} />
        {joinRequestsLoading && <Text>Loading join requests...</Text>}
        {joinRequestsError && <Text style={styles.error}>{joinRequestsError}</Text>}
        {joinRequests.length > 0 && (
          <Text style={styles.json}>{safeStringify(bigIntToString({ joinRequests, total: joinRequestsTotal }), 2)}</Text>
        )}
        <Button title="Get Join Request Count" onPress={handleGetJoinRequestCount} />
        {joinRequestCountLoading && <Text>Loading join request count...</Text>}
        {joinRequestCountError && <Text style={styles.error}>{joinRequestCountError}</Text>}
        {joinRequestCount !== null && (
          <Text style={styles.json}>{safeStringify(bigIntToString({ joinRequestCount }), 2)}</Text>
        )}
        <Text style={styles.label}>User Address for Join Request Status:</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TextInput style={styles.input} value={joinRequestStatusAddress} onChangeText={setJoinRequestStatusAddress} placeholder="0x..." autoCapitalize="none" autoCorrect={false} />
          <PasteButton onPaste={setJoinRequestStatusAddress} />
        </View>
        <Button title="Get Join Request Status" onPress={handleGetJoinRequestStatus} />
        {joinRequestStatusLoading && <Text>Loading join request status...</Text>}
        {joinRequestStatusError && <Text style={styles.error}>{joinRequestStatusError}</Text>}
        {joinRequestStatus !== null && (
          <Text style={styles.json}>{safeStringify(bigIntToString({ joinRequestStatus }), 2)}</Text>
        )}
      </View>
    )}
    {/* Proposals Section */}
    <View style={styles.divider} />
    <TouchableOpacity onPress={() => toggleSection('Proposals')}>
      <Text style={styles.header}>{openSection === 'Proposals' ? '▼' : '▶'} Proposals</Text>
    </TouchableOpacity>
    {openSection === 'Proposals' && (
      <View>
        <Text style={styles.label}>DAO Address for Proposals:</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TextInput style={styles.input} value={proposalsDaoAddress} onChangeText={setProposalsDaoAddress} placeholder="0x..." autoCapitalize="none" autoCorrect={false} />
          <PasteButton onPaste={setProposalsDaoAddress} />
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TextInput style={[styles.input, { flex: 1, marginRight: 8 }]} value={proposalsOffset} onChangeText={setProposalsOffset} placeholder="Offset" keyboardType="numeric" />
          <TextInput style={[styles.input, { flex: 1 }]} value={proposalsLimit} onChangeText={setProposalsLimit} placeholder="Limit" keyboardType="numeric" />
        </View>
        <Button title="Get Proposals (Paginated)" onPress={handleGetProposals} />
        {proposalsLoading && <Text>Loading proposals...</Text>}
        {proposalsError && <Text style={styles.error}>{proposalsError}</Text>}
        {proposals.length > 0 && (
          <View style={{ marginVertical: 10 }}>
            <Text style={{ fontWeight: "bold", marginBottom: 5 }}>Proposals:</Text>
            {proposals.map((proposal, idx) => (
              <View key={idx} style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                <Text style={{ fontFamily: "monospace", fontSize: 12, flex: 1 }}>ID: {proposal.id ?? idx}</Text>
                <CopyButton value={String(proposal.id ?? idx)} />
              </View>
            ))}
            <Text style={styles.json}>{safeStringify(bigIntToString({ proposals, total: proposalsTotal }), 2)}</Text>
          </View>
        )}
        <Button title="Get Proposal Count" onPress={handleGetProposalCount} />
        {proposalCountLoading && <Text>Loading proposal count...</Text>}
        {proposalCountError && <Text style={styles.error}>{proposalCountError}</Text>}
        {proposalCount !== null && (
          <Text style={styles.json}>{safeStringify(bigIntToString({ proposalCount }), 2)}</Text>
        )}
        <Text style={styles.label}>Proposal ID:</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TextInput style={styles.input} value={proposalId} onChangeText={setProposalId} placeholder="ID" keyboardType="numeric" />
          <PasteButton onPaste={setProposalId} />
        </View>
        <Button title="Get Proposal Details" onPress={handleGetProposalDetails} />
        {proposalDetailsLoading && <Text>Loading proposal details...</Text>}
        {proposalDetailsError && <Text style={styles.error}>{proposalDetailsError}</Text>}
        {proposalDetails && (
          <Text style={styles.json}>{safeStringify(bigIntToString(proposalDetails), 2)}</Text>
        )}
      </View>
    )}
    {/* Claims Section */}
    <View style={styles.divider} />
    <TouchableOpacity onPress={() => toggleSection('Claims')}>
      <Text style={styles.header}>{openSection === 'Claims' ? '▼' : '▶'} Claims</Text>
    </TouchableOpacity>
    {openSection === 'Claims' && (
      <View>
        <Text style={styles.label}>DAO Address for Claims:</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TextInput style={styles.input} value={claimsDaoAddress} onChangeText={setClaimsDaoAddress} placeholder="0x..." autoCapitalize="none" autoCorrect={false} />
          <PasteButton onPaste={setClaimsDaoAddress} />
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TextInput style={[styles.input, { flex: 1, marginRight: 8 }]} value={claimsOffset} onChangeText={setClaimsOffset} placeholder="Offset" keyboardType="numeric" />
          <TextInput style={[styles.input, { flex: 1 }]} value={claimsLimit} onChangeText={setClaimsLimit} placeholder="Limit" keyboardType="numeric" />
        </View>
        <Button title="Get Claims (Paginated)" onPress={handleGetClaims} />
        {claimsLoading && <Text>Loading claims...</Text>}
        {claimsError && <Text style={styles.error}>{claimsError}</Text>}
        {claims.length > 0 && (
          <View style={{ marginVertical: 10 }}>
            <Text style={{ fontWeight: "bold", marginBottom: 5 }}>Claims:</Text>
            {claims.map((claim, idx) => (
              <View key={idx} style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                <Text style={{ fontFamily: "monospace", fontSize: 12, flex: 1 }}>ID: {claim.id ?? idx}</Text>
                <CopyButton value={String(claim.id ?? idx)} />
              </View>
            ))}
            <Text style={styles.json}>{safeStringify(bigIntToString({ claims, total: claimsTotal }), 2)}</Text>
          </View>
        )}
        <Button title="Get Claim Count" onPress={handleGetClaimCount} />
        {claimCountLoading && <Text>Loading claim count...</Text>}
        {claimCountError && <Text style={styles.error}>{claimCountError}</Text>}
        {claimCount !== null && (
          <Text style={styles.json}>{safeStringify(bigIntToString({ claimCount }), 2)}</Text>
        )}
        <Text style={styles.label}>Claim ID:</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TextInput style={styles.input} value={claimId} onChangeText={setClaimId} placeholder="ID" keyboardType="numeric" />
          <PasteButton onPaste={setClaimId} />
        </View>
        <Button title="Get Claim Details" onPress={handleGetClaimDetails} />
        {claimDetailsLoading && <Text>Loading claim details...</Text>}
        {claimDetailsError && <Text style={styles.error}>{claimDetailsError}</Text>}
        {claimDetails && (
          <Text style={styles.json}>{safeStringify(bigIntToString(claimDetails), 2)}</Text>
        )}
      </View>
    )}
    {/* Treasury Section */}
    <View style={styles.divider} />
    <TouchableOpacity onPress={() => toggleSection('Treasury')}>
      <Text style={styles.header}>{openSection === 'Treasury' ? '▼' : '▶'} Treasury</Text>
    </TouchableOpacity>
    {openSection === 'Treasury' && (
      <View>
        <Text style={styles.label}>DAO Address for Treasury:</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TextInput style={styles.input} value={treasuryDaoAddress} onChangeText={setTreasuryDaoAddress} placeholder="0x..." autoCapitalize="none" autoCorrect={false} />
          <PasteButton onPaste={setTreasuryDaoAddress} />
        </View>
        <Button title="Get Treasury Address & Balance" onPress={handleGetTreasuryAddressAndBalance} />
        {treasuryBalanceLoading && <Text>Loading treasury balance...</Text>}
        {treasuryBalanceError && <Text style={styles.error}>{treasuryBalanceError}</Text>}
        {treasuryModuleAddress && (
          <Text style={styles.json}>Treasury Address: {treasuryModuleAddress}</Text>
        )}
        {treasuryBalance !== null && (
          <Text style={styles.json}>{safeStringify(bigIntToString({ treasuryBalance }), 2)}</Text>
        )}
      </View>
    )}
    {/* Token Section */}
    <View style={styles.divider} />
    <TouchableOpacity onPress={() => toggleSection('Token')}>
      <Text style={styles.header}>{openSection === 'Token' ? '▼' : '▶'} Token</Text>
    </TouchableOpacity>
    {openSection === 'Token' && (
      <View>
        <Text style={styles.label}>Token Address:</Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TextInput style={styles.input} value={tokenInput} onChangeText={setTokenInput} placeholder="0x..." autoCapitalize="none" autoCorrect={false} />
          <PasteButton onPaste={setTokenInput} />
        </View>
        <Text style={styles.label}>User Address for Token Balance:</Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TextInput style={styles.input} value={tokenBalanceAddress} onChangeText={setTokenBalanceAddress} placeholder="0x..." autoCapitalize="none" autoCorrect={false} />
          <PasteButton onPaste={setTokenBalanceAddress} />
        </View>
        <Button title="Get Member Token Balance" onPress={handleGetMemberTokenBalance} />
        {tokenBalanceLoading && <Text>Loading token balance...</Text>}
        {tokenBalanceError && <Text style={styles.error}>{tokenBalanceError}</Text>}
        {tokenBalance !== null && (
          <Text style={styles.json}>{safeStringify(bigIntToString({ tokenBalance }), 2)}</Text>
        )}
      </View>
    )}
    {/* Module Registry Section */}
    <View style={styles.divider} />
    <TouchableOpacity onPress={() => toggleSection('Module Registry')}>
      <Text style={styles.header}>{openSection === 'Module Registry' ? '▼' : '▶'} Module Registry</Text>
    </TouchableOpacity>
    {openSection === 'Module Registry' && (
      <View>
        <Text style={styles.label}>ModuleRegistry Address:</Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TextInput style={styles.input} value={moduleRegistryInput} onChangeText={setModuleRegistryInput} placeholder="0x..." autoCapitalize="none" autoCorrect={false} />
          <PasteButton onPaste={setModuleRegistryInput} />
        </View>
        <Button title="Get All Registered Modules" onPress={handleGetAllRegisteredModules} />
        {allModulesLoading && <Text>Loading modules...</Text>}
        {allModulesError && <Text style={styles.error}>{allModulesError}</Text>}
        {allModules && (
          <Text style={styles.json}>{safeStringify(allModules, 2)}</Text>
        )}
        <Text style={styles.label}>Module Name:</Text>
        <TextInput style={styles.input} value={moduleName} onChangeText={setModuleName} placeholder="Module name" autoCapitalize="none" autoCorrect={false} />
        <Button title="Get Module Address by Name" onPress={handleGetModuleAddressByName} />
        {moduleAddressByNameLoading && <Text>Loading module address by name...</Text>}
        {moduleAddressByNameError && <Text style={styles.error}>{moduleAddressByNameError}</Text>}
        {moduleAddressByName && (
          <Text style={styles.json}>{safeStringify(bigIntToString({ moduleAddressByName }), 2)}</Text>
        )}
      </View>
    )}
    {/* Utility/Meta Section */}
    <View style={styles.divider} />
    <TouchableOpacity onPress={() => toggleSection('Utility / Meta')}>
      <Text style={styles.header}>{openSection === 'Utility / Meta' ? '▼' : '▶'} Utility / Meta</Text>
    </TouchableOpacity>
    {openSection === 'Utility / Meta' && (
      <View>
        <Button title="Get DAO Token Address (from Treasury)" onPress={handleGetDaoTokenAddress} />
        {daoTokenAddressLoading && <Text>Loading DAO token address...</Text>}
        {daoTokenAddressError && <Text style={styles.error}>{daoTokenAddressError}</Text>}
        {daoTokenAddress && (
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
            <Text style={{ fontFamily: "monospace", fontSize: 12, flex: 1 }}>{daoTokenAddress}</Text>
            <UseButton label="Use as Token" onPress={() => setTokenAddress(daoTokenAddress)} />
            <CopyButton value={daoTokenAddress} />
            <DebugButton label="DAO Token Address" value={daoTokenAddress} />
          </View>
        )}
        <Button title="Get DAO Owner (from Kernel)" onPress={handleGetDaoOwner} />
        {daoOwnerLoading && <Text>Loading DAO owner...</Text>}
        {daoOwnerError && <Text style={styles.error}>{daoOwnerError}</Text>}
        {daoOwner && (
          <Text style={styles.json}>{safeStringify(bigIntToString({ daoOwner }), 2)}</Text>
        )}
      </View>
    )}
    {/* Debug Log Area */}
    <View style={styles.divider} />
    <Text style={styles.header}>Debug Log</Text>
    <View style={{ maxHeight: 200, backgroundColor: '#f9f9f9', borderRadius: 4, padding: 8 }}>
      {debugLogs.map((log, idx) => (
        <Text key={idx} style={{ fontFamily: 'monospace', fontSize: 11, color: '#555' }}>{log}</Text>
      ))}
    </View>
  </ScrollView>
);
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  value: { fontSize: 18, marginTop: 16 },
  error: { color: 'red', marginTop: 8 },
  json: { fontFamily: "monospace", fontSize: 12, marginVertical: 10 },
  divider: { height: 1, backgroundColor: "#eee", marginVertical: 20 },
  label: { marginTop: 20, marginBottom: 5 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 8, borderRadius: 4, marginBottom: 10 },
}); 