import {
  Aptos,
  AptosConfig,
  Network,
  PendingTransactionResponse,
} from '@aptos-labs/ts-sdk';

export type TransactionPayload = {
  function: string;
  typeArguments: string[];
  functionArguments: any[];
};

type ExecuteTransactionParams = {
  signAndSubmitTransaction: any;
  network: Network;
  payload: TransactionPayload;
};

export const executeTransaction = async ({
  signAndSubmitTransaction,
  network,
  payload,
}: ExecuteTransactionParams): Promise<boolean> => {
  const aptosConfig = new AptosConfig({ network });
  const aptos = new Aptos(aptosConfig);

  const pendingTxn: PendingTransactionResponse = await signAndSubmitTransaction(
    { data: payload }
  );

  const committedTxn = await aptos.waitForTransaction({
    transactionHash: pendingTxn.hash,
  });

  return committedTxn.success;
};
