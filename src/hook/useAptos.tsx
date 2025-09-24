import { Network } from '@aptos-labs/ts-sdk';
import { WalletSelector } from '@aptos-labs/wallet-adapter-ant-design';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { TransactionPayload, executeTransaction } from './useAptosExecuteTxs';
import { APTOS_OFFSET } from '@/constant';

const useAptos = () => {
  const { account, signAndSubmitTransaction, network, changeNetwork } =
    useWallet();

  const TARGET_NETWORK = Network.TESTNET;

  const isWrongNetwork =
    account && network?.name.toLowerCase() !== TARGET_NETWORK;

  const handleSwitchNetwork = async () => {
    if (!isWrongNetwork) return;
    try {
      await changeNetwork(TARGET_NETWORK);
    } catch (error) {
      console.error('Failed to switch network:', error);
    }
  };

  const CONTRACT_ADDRESS =
    '0xaf1ddbbb71f31aa74711fb67cd0e6d412fd909f514b4a71be0e59dd5629e44e8';

  const handleTransaction = async (payload: TransactionPayload) => {
    // if (isWrongNetwork) {
    //   console.log(
    //     `DApp only active on ${TARGET_NETWORK}. Please switch network!`
    //   );
    //   return false;
    // }
    // if (!account || !network?.name) {
    //   console.log('Connect Wallet');
    //   return false;
    // }

    return executeTransaction({
      signAndSubmitTransaction,
      network: network?.name as Network,
      payload,
    });
  };

  const createOfferBuyAptos = async (data: any) => {
    const payload: TransactionPayload = {
      function: `${CONTRACT_ADDRESS}::otc_trade::create_buy_order`,
      typeArguments: [`${data?.tokenAddress}`],
      functionArguments: [
        data?.price * APTOS_OFFSET,
        data?.amount * 10 ** data?.decimal,
        data?.typeMatch,
      ],
    };
    return handleTransaction(payload);
  };

  const cancelOfferAptos = async (data: any) => {
    const payload: TransactionPayload = {
      function: `${CONTRACT_ADDRESS}::otc_trade::cancel_order`,
      typeArguments: [`${data?.tokenAddress}`],
      functionArguments: [data?.offerId],
    };
    return handleTransaction(payload);
  };

  const createOfferSellAptos = async (data: any) => {
    const payload: TransactionPayload = {
      function: `${CONTRACT_ADDRESS}::otc_trade::create_sell_order`,
      typeArguments: [`${data?.tokenAddress}`],
      functionArguments: [
        data?.price * APTOS_OFFSET,
        data?.amount * 10 ** data?.decimal,
        data?.typeMatch,
      ],
    };
    return handleTransaction(payload);
  };

  const acceptOfferAptos = async (data: any) => {
    const payload: TransactionPayload = {
      function: `${CONTRACT_ADDRESS}::otc_trade::accept_order`,
      typeArguments: [`${data?.tokenAddress}`],
      functionArguments: [data?.offerId, data?.amount * 10 ** data?.decimal],
    };
    return handleTransaction(payload);
  };

  return {
    createOfferBuyAptos,
    createOfferSellAptos,
    cancelOfferAptos,
    acceptOfferAptos,
  };
};

export default useAptos;
