import { ethers } from 'ethers';
import { AMOY_RPC_URL } from '../utils/rpc';
import TreasuryModuleAbi from './abis/TreasuryModule.json';
import TokenAbi from './abis/Token.json';
import DaoKernelAbi from './abis/DaoKernel.json';

// Create RPC provider once
const provider = new ethers.JsonRpcProvider(AMOY_RPC_URL);

/**
 * Get DAO's treasury balance directly from blockchain
 * @param daoAddress The DAO's address
 * @returns Promise<bigint> Balance in wei
 */
export async function getTreasuryBalance(daoAddress: string): Promise<bigint> {
  try {
    console.log('Getting treasury balance for DAO:', daoAddress);
    console.log('Using RPC URL:', AMOY_RPC_URL);
    
    // First get the treasury module address from the DAO
    const daoContract = new ethers.Contract(
      daoAddress,
      DaoKernelAbi.abi,
      provider
    );
    
    const treasuryModuleAddress = await daoContract.treasuryModule();
    console.log('Treasury module address:', treasuryModuleAddress);
    
    if (!treasuryModuleAddress || treasuryModuleAddress === ethers.ZeroAddress) {
      throw new Error('Treasury module not found for DAO');
    }
    
    // Then get the balance from the treasury module
    const treasuryModule = new ethers.Contract(
      treasuryModuleAddress,
      TreasuryModuleAbi.abi,
      provider
    );
    
    const balance = await treasuryModule.getTokenBalance();
    console.log('Raw token balance result:', balance.toString());
    return balance;
  } catch (error: any) {
    // Log the full error for debugging
    console.error('Failed to fetch treasury balance:', error);
    
    // Log structured error info
    const errorInfo = {
      message: error?.message || 'Unknown error',
      code: error?.code,
      data: error?.data,
      method: error?.method,
      transaction: error?.transaction
    };
    console.error('Error details:', errorInfo);
    throw error;
  }
}

/**
 * Get user's token balance directly from blockchain
 * @param tokenAddress The token contract address
 * @param userAddress The user's wallet address
 * @returns Promise<bigint> Balance in wei
 */
export async function getUserTokenBalance(tokenAddress: string, userAddress: string): Promise<bigint> {
  try {
    console.log('Getting token balance for user:', userAddress, 'token:', tokenAddress);
    
    const tokenContract = new ethers.Contract(
      tokenAddress,
      TokenAbi.abi,
      provider
    );
    
    const balance = await tokenContract.balanceOf(userAddress);
    console.log('Raw token balance result:', balance.toString());
    return balance;
  } catch (error: any) {
    // Log the full error for debugging
    console.error('Failed to fetch user token balance:', error);
    
    // Log structured error info
    const errorInfo = {
      message: error?.message || 'Unknown error',
      code: error?.code,
      data: error?.data,
      method: error?.method,
      transaction: error?.transaction
    };
    console.error('Error details:', errorInfo);
    throw error;
  }
} 