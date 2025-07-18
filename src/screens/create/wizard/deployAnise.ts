import { Alert, Linking } from 'react-native';
import type { Template } from './CreateWizard';
import { ethers, Interface } from 'ethers';
import modules from '../../../templates/modules';
import { getContractAddress } from '../../../utils/contractAddresses';
import DaoFactoryAbiJson from '../../../services/abis/DaoFactory.json';
import { walletConnectService } from '../../../../wallet/walletConnectInstance';

const DaoFactoryAbi = DaoFactoryAbiJson.abi || DaoFactoryAbiJson;
const CHAIN_ID = 80002; // Polygon Amoy
const POLYSCAN_PREFIX = 'https://amoy.polygonscan.com/address/';

function encodeInitData(moduleName: string, config: Record<string, any>, adminAddress: string) {
  const mod = modules[moduleName];
  if (!mod || !mod.initParamsSchema || mod.initParamsSchema.length === 0) return '0x';
  if (moduleName === 'MemberModule') {
    return ethers.AbiCoder.defaultAbiCoder().encode(['address'], [adminAddress]);
  }
  if (moduleName === 'ProposalVotingModule' || moduleName === 'ClaimVotingModule') {
    const param = mod.initParamsSchema[0];
    return ethers.AbiCoder.defaultAbiCoder().encode(['uint256'], [config[param.name] ?? param.default ?? 51]);
  }
  return '0x';
}

export async function deployAnise(template: Template, config: Record<string, any>) {
  try {
    if (!walletConnectService.isConnected() || !walletConnectService.session) {
      Alert.alert('Wallet Not Connected', 'Please connect your wallet before deploying.');
      return;
    }
    const signerAddress = walletConnectService.session.namespaces.eip155.accounts[0].split(':').pop();
    if (!signerAddress) throw new Error('Could not get wallet address');

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

    // Encode the createDao call
    const iface = new Interface(DaoFactoryAbi);
    const data = iface.encodeFunctionData('createDao', [
      moduleAddresses,
      initData,
      metadata,
      treasuryLogic,
      tokenAddress
    ]);

    // Prepare transaction
    const tx = {
      from: signerAddress,
      to: factoryAddress,
      data,
      chainId: CHAIN_ID,
      // Do not set gasLimit; let MetaMask estimate it for best compatibility.
    };

    // Open MetaMask for user confirmation
    Linking.openURL('metamask://');

    // Send transaction via WalletConnect
    const txHash = await walletConnectService.sendTransaction(tx);
    // After sending, open MetaMask again to ensure user sees the prompt
    setTimeout(() => {
      Linking.openURL('metamask://');
    }, 500);

    // Show only final confirmation with Polyscan link
    Alert.alert(
      'Transaction Sent',
      `Your DAO deployment transaction was sent!\n\nTx Hash: ${txHash}\n\nYou can track it on Polyscan. Once confirmed, your DAO will be live.`,
      [
        { text: 'View on Polyscan', onPress: () => Linking.openURL(`https://amoy.polygonscan.com/tx/${txHash}`) },
        { text: 'OK' },
      ]
    );
  } catch (err: any) {
    // Only show a single error alert if deployment fails
    Alert.alert('Deployment Error', err?.message || String(err));
    console.log('[deployAnise] Deployment error:', err);
  }
} 