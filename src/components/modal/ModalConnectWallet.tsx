import React, { useEffect } from 'react';
import CustomModal from '../custom/CustomModal';
import CustomImage from '@/components/custom/CustomImage';
import { toastError } from '@/utils/toast';

import useStore from '@/store';
import { getData, saveData } from '@/utils/localStorage';
import { ACCESS_TOKEN, CHAIN, REFRESH_TOKEN, SIGN_MESSAGE } from '@/constant';
import { loginApi } from '@/service/connect';
import { jwtDecode } from 'jwt-decode';
import useMounted from '@/hook/useMounted';
import { setToken } from '@/service/api';
import useApplication from '@/hook/useApplication';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { WalletSelector } from '@aptos-labs/wallet-adapter-ant-design';

const ModalConnectWallet = ({ open, onCancel }: any) => {
  const { isMounted } = useMounted();
  const { account: aptosAccount, signMessage: aptosSignMessage } = useWallet();
  const { handleLogout } = useApplication();

  const setIsAuthenticated = useStore((state) => state.setIsAuthenticated);
  const currentActiveChain = useStore((state) => state.currentActiveChain);
  const currentConnectedAccount = useStore(
    (state) => state.currentConnectedAccount
  );
  const setCurrentConnectedAccount = useStore(
    (state) => state.setCurrentConnectedAccount
  );

  useEffect(() => {
    const login = async () => {
      const accessToken = getData(ACCESS_TOKEN);
      const refreshToken = getData(REFRESH_TOKEN);
      const decodedData: any = accessToken
        ? jwtDecode(accessToken as string)
        : {};
      if (
        (!accessToken && !refreshToken) ||
        (accessToken && decodedData?.walletAddress !== currentConnectedAccount)
      ) {
        try {
          let signResponse;
          let res = {} as any;

          if (!aptosSignMessage || !aptosAccount) {
            toastError(
              'Wallet not connected or does not support message signing.'
            );
            handleLogout();
            return;
          }

          const payload = {
            message: SIGN_MESSAGE,
            nonce: `nonce_${Date.now()}`,
          };

          signResponse = await aptosSignMessage(payload);

          let signature = null as any;
          if (typeof signResponse.signature === 'string') {
            signature = signResponse.signature;
          } else signature = Array.from(signResponse.signature.toUint8Array());
          res = await loginApi({
            publicKey: aptosAccount.publicKey.toString(),
            walletAddress: aptosAccount?.address.toString(),
            message: signResponse.fullMessage,
            signature: signature,
            networkType: currentActiveChain,
          });

          if (res?.data?.accessToken) {
            setToken(res.data.accessToken);
            saveData(ACCESS_TOKEN, res.data.accessToken);
            saveData(REFRESH_TOKEN, res.data.refreshToken);
            setIsAuthenticated(true);
            onCancel();
          }
        } catch (error: any) {
          // Handle user rejection or other errors
          toastError(
            error || error?.message || 'Signature request was rejected.'
          );
          setIsAuthenticated(false);
          handleLogout();
        }
      } else {
        setToken(accessToken as string);
        setIsAuthenticated(true);
        onCancel();
      }
    };

    if (currentConnectedAccount && isMounted) {
      login();
    }
  }, [currentConnectedAccount, isMounted]);

  useEffect(() => {
    if (aptosAccount?.address) {
      currentActiveChain == CHAIN.APTOS &&
        aptosAccount?.address &&
        setCurrentConnectedAccount(aptosAccount?.address?.toString() as any);
    }
  }, [aptosAccount?.address]);

  return (
    <CustomModal open={open} onCancel={onCancel} width={568}>
      <div className='rounded-xl p-[40px]'>
        <CustomImage
          src='/images/connect.png'
          alt='err'
          width={540}
          height={120}
          className='mb-6'
        />

        <div className='flex cursor-pointer flex-col items-center rounded-2xl bg-[#141a36] py-3 text-[16px] font-[400]'>
          <CustomImage
            src='/images/wallet/aptos_white.png'
            alt='err'
            width={56}
            height={56}
            className='mb-[12px] rounded-full'
          />
          <WalletSelector />
        </div>
      </div>
    </CustomModal>
  );
};

export default ModalConnectWallet;
