import { ethers } from 'ethers';
import { useCallback, useContext, useEffect, useState } from 'react';
import { hs } from './contracts/HeavySuit';
import { provider } from './ethers';
import { UserContext } from './UserContext';

export const Hanger = () => {
  const [numSuits, setNumSuits] = useState(0);
  const [deposit, setDeposit] = useState('');
  const { loading, address } = useContext(UserContext);

  const updateBalance = useCallback(async () => {
    if (address) {
      const balance = await hs.balanceOf(address);
      setNumSuits(balance.toNumber());

      for (let i = 0; balance.gt(i); i++) {
        const tokenId = await hs.tokenOfOwnerByIndex(address, i);
        const metadata = await hs.tokenURI(tokenId);
        console.log(metadata);
      }
    }
  }, [setNumSuits, address]);

  const updateDeposit = useCallback(async () => {
    if (address) {
      const d = await hs.depositOf(address);
      setDeposit(ethers.utils.formatEther(d));
    }
  }, [address]);

  useEffect(() => {
    const callback = (pilot: string, tokenId: ethers.BigNumber) => {
      updateBalance();
      updateDeposit();
    };
    provider.on(hs.filters.SuitManufactured(address), callback);
    return () => {
      provider.off(hs.filters.SuitManufactured(address), callback);
    };
  }, [address, updateBalance, updateDeposit]);

  useEffect(() => {
    const callback = (pilot: string, weiAmount: ethers.BigNumber) => {
      updateDeposit();
    };
    provider.on(hs.filters.OrderPlaced(address), callback);
    provider.on(hs.filters.OrderCancelled(address), callback);
    return () => {
      provider.off(hs.filters.OrderPlaced(address), callback);
      provider.off(hs.filters.OrderCancelled(address), callback);
    };
  }, [address, updateDeposit]);

  useEffect(() => {
    if (!loading && address) {
      updateBalance();
      updateDeposit();
    }
  }, [address, loading, updateDeposit, updateBalance]);

  if (loading) {
    return null;
  }

  return (
    <>
      <div>{numSuits}</div>
      <div>{deposit}</div>
    </>
  );
};
