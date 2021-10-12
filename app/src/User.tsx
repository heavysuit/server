import { Box, Button, HStack, Spinner, Text } from '@chakra-ui/react';
import { ethers } from 'ethers';
import { useCallback, useEffect, useState } from 'react';

const metamask = (window as any).ethereum;
const provider = new ethers.providers.Web3Provider(metamask);

export function User() {
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length === 0) {
        setAddress(null);
      } else {
        const user = provider.getSigner();
        const addr = await user.getAddress();
        setAddress(addr);
      }
      setLoading(false);
    };
    return metamask.on('accountsChanged', handleAccountsChanged);
  }, [setAddress, setLoading]);

  useEffect(() => {
    const user = provider.getSigner();
    user
      .getAddress()
      .then((addr) => {
        setAddress(addr);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [setAddress]);

  const handleLogin = useCallback(() => {
    provider.send('eth_requestAccounts', []);
  }, []);

  useEffect(() => {
    if (address) {
    }
  }, [address]);

  const content = loading ? (
    <Spinner />
  ) : (
    <>
      <Box>
        {address ? (
          <Text>{address}</Text>
        ) : (
          <Button onClick={handleLogin}>Connect to MetaMask</Button>
        )}
      </Box>
    </>
  );

  return <HStack>{content}</HStack>;
}
