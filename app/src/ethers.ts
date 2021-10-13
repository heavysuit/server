import { ethers } from 'ethers';

export const metamask = (window as any).ethereum;
export const provider = new ethers.providers.Web3Provider(metamask);