import { ethers } from 'ethers';
import { provider } from '../ethers';
import { HeavySuit } from '../typechain';
import artifact from './HeavySuit.json';

const { abi } = artifact;
const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

export const hs = new ethers.Contract(contractAddress, abi, provider) as HeavySuit;

hs.orderFee().then(console.log);
console.log(hs);

(window as any).hs = hs;