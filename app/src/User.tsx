import { Box, Button, HStack, Spinner, Text } from '@chakra-ui/react';
import { useCallback, useContext, useEffect } from 'react';
import { provider } from './ethers';
import { UserContext } from './UserContext';

export function User() {
  const { address, loading } = useContext(UserContext);

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
