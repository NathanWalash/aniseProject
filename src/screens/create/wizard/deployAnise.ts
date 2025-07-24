import { Alert, Linking } from 'react-native';
import type { Template } from './CreateWizard';
import { ethers, Interface } from 'ethers';
import modules from '../../../templates/modules';
import { getContractAddress } from '../../../utils/contractAddresses';
import DaoFactoryAbiJson from '../../../services/abis/DaoFactory.json';
import { walletConnectService } from '../../../../wallet/walletConnectInstance';
import { getWalletAddress } from '../../../services/walletApi';
import { createDao } from '../../../services/daoApi';

const DaoFactoryAbi = DaoFactoryAbiJson.abi || DaoFactoryAbiJson;
const CHAIN_ID = 80002; // Polygon Amoy
const POLYSCAN_PREFIX = 'https://amoy.polygonscan.com/address/';

// Helper to generate the unique config key used in the form
function getModuleParamKey(moduleName: string, paramName: string) {
  return `${moduleName}_${paramName}`;
}

function encodeInitData(moduleName: string, config: Record<string, any>, adminAddress: string) {
  if (moduleName === 'MemberModule') {
    // Always encode the admin address, regardless of schema
    return ethers.AbiCoder.defaultAbiCoder().encode(['address'], [adminAddress]);
  }
  const mod = modules[moduleName];
  if (!mod || !mod.initParamsSchema || mod.initParamsSchema.length === 0) return '0x';
  if (moduleName === 'ProposalVotingModule' || moduleName === 'ClaimVotingModule') {
    const param = mod.initParamsSchema[0]; // e.g., { name: 'approvalThreshold', ... }
    const configKey = getModuleParamKey(moduleName, param.name);
    const value = config[configKey] ?? param.default ?? 51;
    return ethers.AbiCoder.defaultAbiCoder().encode(['uint256'], [value]);
  }
  return '0x';
}

export async function deployAnise(template: Template, config: Record<string, any>, linkedAddress: string, creatorUid: string) {
  try {
    if (!walletConnectService.isConnected() || !walletConnectService.session) {
      Alert.alert('Wallet Not Connected', 'Please connect your wallet before deploying.');
      return;
    }
    const signerAddress = await getWalletAddress();
    if (!signerAddress) throw new Error('Could not get wallet address');
    // Ensure the session address matches the linked address
    if (linkedAddress && signerAddress.toLowerCase() !== linkedAddress.toLowerCase()) {
      Alert.alert('Wrong Wallet', 'Please connect the wallet you have linked to your account.');
      return;
    }

    // Prepare module addresses and init data
    const moduleKeys = template.modules;
    const moduleAddresses = moduleKeys.map((m) => {
      if (m === 'MemberModule') return getContractAddress('MemberLogic');
      if (m === 'ProposalVotingModule') return getContractAddress('ProposalLogic');
      if (m === 'ClaimVotingModule') return getContractAddress('ClaimLogic');
      if (m === 'TreasuryModule') return getContractAddress('TreasuryLogic');
      throw new Error('Unknown module: ' + m);
    });
    const initData = moduleKeys.map((m) => encodeInitData(m, config, signerAddress));

    // Prepare metadata
    const metadata = {
      name: config.daoName,
      description: config.daoBrief,
      templateId: template.templateId,
      mandate: config.daoMandate,
      intendedAudience: config.intendedAudience,
      isPublic: !!config.isPublic,
    };

    // Prepare treasury logic and token addresses
    const treasuryLogic = getContractAddress('TreasuryLogic');
    const tokenAddress = getContractAddress('Token');
    const factoryAddress = getContractAddress('DaoFactory');

    // Build modules object for backend
    const modules: Record<string, any> = {};
    for (const m of moduleKeys) {
      const moduleConfig: Record<string, any> = {};

      if (m === 'ProposalVotingModule' || m === 'ClaimVotingModule') {
        const configKey = getModuleParamKey(m, 'approvalThreshold');
        const paramSchema = modules[m]?.initParamsSchema?.[0];
        const defaultValue = paramSchema?.default ?? 51;
        const value = config[configKey] !== undefined ? config[configKey] : defaultValue;
        moduleConfig.approvalThreshold = value;
      }

      if (m === 'TreasuryModule') {
        modules[m] = {
          address: getContractAddress('TreasuryLogic'),
          config: moduleConfig
        };
      } else {
        modules[m] = {
          config: moduleConfig
        };
      }
    }

    // Encode the createDao call
    const iface = new Interface(DaoFactoryAbi);
    const data = iface.encodeFunctionData('createDao', [
      moduleAddresses,
      initData,
      metadata,
      treasuryLogic,
      tokenAddress
    ]);

    // Log transaction details
    console.log('[deployAnise] About to send transaction with:', {
      moduleAddresses,
      initData,
      metadata,
      treasuryLogic,
      tokenAddress,
      factoryAddress,
      tx: {
        from: signerAddress,
        to: factoryAddress,
        data,
        chainId: CHAIN_ID,
      },
      modulesForBackend: modules,
    });

    // Prepare transaction (let MetaMask handle gas estimation)
    const tx = {
      from: signerAddress,
      to: factoryAddress,
      data,
      chainId: CHAIN_ID,
    };

    // Open MetaMask for user confirmation
    Linking.openURL('metamask://');

    // Send transaction via WalletConnect
    const txHash = await walletConnectService.sendTransaction(tx);

    // Add DAO to Firestore via backend
    await createDao(metadata, txHash, creatorUid, modules);

    Alert.alert(
      'Transaction Sent',
      `Your DAO deployment transaction was sent!\n\nTx Hash: ${txHash}\n\nYou can track it on Polyscan. Once confirmed, your DAO will be live.`,
      [
        { text: 'View on Polyscan', onPress: () => Linking.openURL(`https://amoy.polygonscan.com/tx/${txHash}`) },
        { text: 'OK' },
      ]
    );
  } catch (err: unknown) {
    let errorMsg: string;
    if (err instanceof Error) {
      errorMsg = err.message;
    } else if (typeof err === 'string') {
      errorMsg = err;
    } else if (err && typeof err === 'object' && 'message' in err && typeof (err as any).message === 'string') {
      errorMsg = (err as { message: string }).message;
    } else {
      errorMsg = 'An unexpected error occurred.';
    }
    Alert.alert('Deployment Error', errorMsg);
    console.log('[deployAnise] Deployment error:', err);
  }
} 