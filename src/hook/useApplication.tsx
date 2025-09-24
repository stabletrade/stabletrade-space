import { ACCESS_TOKEN, CHAIN, REFRESH_TOKEN } from '@/constant';
import { setToken } from '@/service/api';
import useStore from '@/store';
import { deleteData } from '@/utils/localStorage';
import { useWallet } from '@aptos-labs/wallet-adapter-react';

const useApplication = () => {

  const setIsAuthenticated = useStore((state) => state.setIsAuthenticated);
  const { disconnect: aptosDisconnect } = useWallet();

  const setCurrentConnectedAccount = useStore(
    (state) => state.setCurrentConnectedAccount
  );

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentConnectedAccount('');
    setToken(undefined);
    deleteData(ACCESS_TOKEN);
    deleteData(REFRESH_TOKEN);
    aptosDisconnect();
  };

  return { handleLogout };
};

export default useApplication;
