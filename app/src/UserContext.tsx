import { createContext, PropsWithChildren, useEffect, useState } from 'react';
import { metamask, provider } from './ethers';

interface UserContextType {
  loading: boolean;
  address: string | null;
}

export const UserContext = createContext<UserContextType>({
  loading: false,
  address: null,
});

export const UserContextProvider = (props: PropsWithChildren<{}>) => {
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

  return (
    <UserContext.Provider value={{ loading, address }}>
      {props.children}
    </UserContext.Provider>
  );
};
