import { ethers } from 'ethers';
import * as functions from 'firebase-functions';
import artifact from './artifacts/contracts/HeavySuit.sol/HeavySuit.json';
import { HeavySuit } from './typechain';

const rpcURL = functions.config().ethereum.rpc;
if (!rpcURL) {
  throw new Error('Missing config.ethereum.rpc');
}

const privateKey = functions.config().ethereum.wallet;
if (!privateKey) {
  throw new Error('Missing config.ethereum.wallet');
}

export const provider = new ethers.providers.JsonRpcProvider(rpcURL);
export const wallet = new ethers.Wallet(privateKey, provider);

const { abi } = artifact;
const contractAddress = functions.config().ethereum.contract;
if (!contractAddress) {
  throw new Error('Missing config.ethereum.contract');
}

export const hs = new ethers.Contract(
  contractAddress,
  abi,
  wallet,
) as HeavySuit;
