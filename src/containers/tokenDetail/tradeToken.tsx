import IconArrowDown from '@/assets/icons/IconArrowDown';
import IconInfo from '@/assets/icons/IconInfo';
import CustomImage from '@/components/custom/CustomImage';
import CustomTooltip from '@/components/custom/CustomTooltip';
import FormatPrice from '@/components/FormatPrice';
import TokenImage from '@/components/TokenImage';
import {
  APTOS_OFFSET,
  CHAIN,
  ORDER_MATCH_TYPE,
  ORDER_TYPE,
  ORDER_TYPE_FOR_USER,
  PRICE_TYPE,
} from '@/constant';
import {
  useGetTokenDetail,
  useGetTokenPrice,
} from '@/hook/queries/useGetListToken';
import useAptos from '@/hook/useAptos';
import useStore from '@/store';
import { delay, formatBalance, formatWallet, getTokenCurrency } from '@/utils';
import { toastError, toastSuccess } from '@/utils/toast';
import { Aptos, AptosConfig } from '@aptos-labs/ts-sdk';
import { useQueryClient } from '@tanstack/react-query';

import { Button, Collapse } from 'antd';
import { Network } from 'aptos';
import BigNumber from 'bignumber.js';
import { useParams, usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { NumericFormat } from 'react-number-format';
const { Panel } = Collapse;

const TradeToken = () => {
  const params = useParams();
  const queryClient = useQueryClient();
  const { acceptOfferAptos } = useAptos();
  const orderDetail = useStore((state: any) => state.orderDetail);
  const isAuthenticated = useStore((state: any) => state.isAuthenticated);
  const selectedToken = useStore((state: any) => state.selectedToken);
  const currentActiveChain = useStore((state) => state.currentActiveChain);

  const currentConnectedAccount = useStore(
    (state: any) => state.currentConnectedAccount
  );
  const setShowModalConnectWallet = useStore(
    (state) => state.setShowModalConnectWallet
  );

  const setShowModalTradeToken = useStore(
    (state) => state.setShowModalTradeToken
  );
  const aptPrice = useStore((state: any) => state.aptPrice);

  // const { data: tokenPrice } = useGetTokenPrice({
  //   tokenAddress: params?.id || orderDetail?.token0Address,
  // });

  const { data: tokenDetail } = useGetTokenDetail({
    tokenAddress: params?.id || orderDetail?.token0Address,
  });

  const [loading, setLoading] = useState<any>(0);

  const [input, setInput] = useState<any>(0);
  const [output, setOutput] = useState<any>(0);

  const type = ORDER_TYPE_FOR_USER[orderDetail?.orderType]?.toLowerCase();
  const price = formatBalance(
    orderDetail?.priceType == PRICE_TYPE.FIXED
      ? orderDetail?.price
      : (orderDetail?.price / aptPrice)?.toFixed(6)
  );
  const typeMatch = ORDER_MATCH_TYPE[orderDetail?.matchType] as any;

  const amountToken = formatBalance(
    orderDetail?.remainAmount,
    orderDetail?.token0Decimal
  );
  const amountAPT = price * amountToken;

  const numberRegex = /^[0-9]*\.?[0-9]*$/;

  const handleChangeInput = async (amount: any, event: any) => {
    if (event) {
      if (numberRegex.test(amount) == false && amount) return;
      if (!Number(amount)) {
        setInput('');
        setOutput('');
      } else {
        if (type == 'buy') {
          setInput(amount);
          setOutput(new BigNumber(amount).dividedBy(price).toNumber());
        } else if (type == 'sell') {
          setInput(amount);
          setOutput(new BigNumber(amount).multipliedBy(price).toNumber());
        }
      }
    }
  };

  const handleChangeOutput = async (amount: any, event: any) => {
    if (event) {
      if (numberRegex.test(amount) == false && amount) return;
      if (!Number(amount)) {
        setInput('');
        setOutput('');
      } else {
        if (type == 'buy') {
          setOutput(amount);
          setInput(new BigNumber(amount).multipliedBy(price).toNumber());
        } else if (type == 'sell') {
          setOutput(amount);
          setInput(new BigNumber(amount).dividedBy(price).toNumber());
        }
      }
    }
  };

  const handleSetQuick = (quality: any) => {
    const balanceAPTAvailable =
      balanceNativeToken <=
      new BigNumber(amountAPT).multipliedBy(quality).toNumber()
        ? balanceNativeToken
        : amountAPT;
    const balanceTokenAvailable =
      balanceToken <= amountToken * quality ? balanceToken : amountToken;

    if (type == 'buy') {
      setInput(
        new BigNumber(balanceAPTAvailable).multipliedBy(quality).toNumber()
      );
      setOutput(
        new BigNumber(balanceAPTAvailable)
          .multipliedBy(quality)
          .dividedBy(price)
          .toNumber()
      );
    } else if (type == 'sell') {
      setInput(
        new BigNumber(balanceTokenAvailable).multipliedBy(quality).toNumber()
      );
      setOutput(
        new BigNumber(balanceTokenAvailable)
          .multipliedBy(quality)
          .multipliedBy(price)
          .toNumber()
      );
    }
  };

  useEffect(() => {
    if (orderDetail?.token0Address) {
      if (type == 'buy') {
        setInput(amountAPT);
        setOutput(amountToken);
      } else if (type == 'sell') {
        setInput(amountToken);
        setOutput(amountAPT);
      }
    } else {
      setInput(0);
      setOutput(0);
    }
  }, [orderDetail]);

  const [balanceNativeToken, setBalanceNativeToken] = useState(0);
  const [balanceToken, setBalanceToken] = useState(0);

  const aptos = useMemo(() => {
    const aptosConfig = new AptosConfig({ network: Network.TESTNET });
    return new Aptos(aptosConfig);
  }, []);

  useEffect(() => {
    const fetchBalances = async () => {
      if (!currentConnectedAccount) {
        setBalanceNativeToken(0);
        setBalanceToken(0);
        return;
      }

      if (currentActiveChain === CHAIN.APTOS) {
        try {
          const nativeBalance = await aptos.getAccountAPTAmount({
            accountAddress: currentConnectedAccount,
          });
          console.log(nativeBalance,"nativeBalance", currentConnectedAccount)
          setBalanceNativeToken(nativeBalance / APTOS_OFFSET);
        } catch (e) {
          setBalanceNativeToken(0);
          console.error('Cannot get APT Balance:', e);
        }

        if (orderDetail?.token0Address) {
          try {
            const amount = await aptos.getAccountCoinAmount({
              accountAddress: currentConnectedAccount,
              coinType: orderDetail.token0Address,
            });
            const decimals = tokenDetail?.data?.decimal || 8;
            setBalanceToken(amount / 10 ** decimals);
          } catch (e) {
            setBalanceToken(0);
            console.error('Could not fetch token balance, likely 0:', e);
          }
        } else {
          setBalanceToken(0);
        }
      }
    };

    fetchBalances();
  }, [
    currentActiveChain,
    currentConnectedAccount,
    aptos,
    orderDetail?.token0Address,
  ]);

  const handleConfirmOrder = async () => {
    try {
      if (!isAuthenticated) {
        return setShowModalConnectWallet(true);
      }
      if (
        (type == 'sell' && balanceToken < input) ||
        (type == 'buy' && balanceNativeToken < input)
      ) {
        return toastError('Insufficient funds!');
      }
      if (
        (type == 'sell' && amountToken < input) ||
        (type == 'buy' && amountAPT < input)
      ) {
        return toastError('Max Amount Reached!');
      }
      setLoading(true);
      let res = undefined as any;
      if (currentActiveChain == CHAIN.APTOS) {
        res = await acceptOfferAptos({
          typeOrder: ORDER_TYPE[orderDetail?.orderType]?.toLowerCase(),
          typeMatch: typeMatch,
          amount:
            ORDER_TYPE[orderDetail?.orderType]?.toLowerCase() == 'sell'
              ? output
              : input,
          price: price,
          offerId: orderDetail?.orderId,
          tokenAddress: orderDetail?.token0Address,
          isDC: PRICE_TYPE[orderDetail?.priceType] == 'FLEXIBLE' ? true : false,
          DCValue: orderDetail?.discountPercent,
          decimal: orderDetail?.token0Decimal,
        });
      }
      if (res) {
        await delay(5000);
        setShowModalTradeToken(false);
        toastSuccess('Accept Offer Success!');
        setInput(0);
        setOutput(0);
        queryClient.invalidateQueries({ queryKey: ['list-order'] });
        queryClient.invalidateQueries({ queryKey: ['user-order'] });
        queryClient.invalidateQueries({ queryKey: ['list-activities'] });
      }
    } catch (error: any) {
      toastError(error || error?.message);
    } finally {
      setLoading(false);
    }
  };

  const currency = getTokenCurrency(currentActiveChain);

  const dataInfo = [
    {
      title: (
        <div className='flex items-center gap-2 text-sm font-bold text-secondary'>
          Price{' '}
          <CustomTooltip
            color='#0d1255'
            title={
              <div className='text-center font-semibold text-white'>
                Price set by the order creator for this token.
              </div>
            }
          >
            <IconInfo />
          </CustomTooltip>
        </div>
      ),
      value: (
        <div className='flex items-center gap-2'>
          <FormatPrice
            // number={(tokenPrice?.data?.priceInUsd || 0) / aptPrice}
            number={price}
          />
          {currency}
        </div>
      ),
    },
    {
      title: (
        <div className='flex items-center gap-2 text-sm font-bold text-secondary'>
          Amount
          <CustomTooltip
            color='#0d1255'
            title={
              <div className='text-center font-semibold text-white'>
                Total tokens offered by order creator.
              </div>
            }
          >
            <IconInfo />
          </CustomTooltip>
        </div>
      ),
      value: (
        <div className='flex items-center gap-2'>
          <FormatPrice
            number={formatBalance(
              orderDetail?.token0Amount,
              orderDetail?.token0Decimal
            )}
          />
          {tokenDetail?.data?.tokenSymbol}
        </div>
      ),
    },
    {
      title: (
        <div className='flex items-center gap-2 text-sm font-bold text-secondary'>
          For{' '}
          <CustomTooltip
            color='#0d1255'
            title={
              <div className='text-center font-semibold text-white'>
                Total size of the order.
              </div>
            }
          >
            <IconInfo />
          </CustomTooltip>
        </div>
      ),
      value: (
        <div className='flex items-center gap-2'>
          <FormatPrice
            number={formatBalance(
              orderDetail?.token1Amount,
              orderDetail?.token1Decimal
            )}
          />
          {currency}
        </div>
      ),
    },
    {
      title: (
        <div className='flex items-center gap-2 text-sm font-bold text-secondary'>
          Match Type
          <CustomTooltip
            color='#0d1255'
            title={
              <div className='text-center font-semibold text-white'>
                Multiple users can match the order.
              </div>
            }
          >
            <IconInfo />
          </CustomTooltip>
        </div>
      ),
      value: typeMatch || '--',
    },
    {
      title: (
        <div className='flex items-center gap-2 text-sm font-bold text-secondary'>
          Match Amount
          <CustomTooltip
            color='#0d1255'
            title={
              <div className='text-center font-semibold text-white'>
                Total amount has been matched so far.
              </div>
            }
          >
            <IconInfo />
          </CustomTooltip>
        </div>
      ),
      value: (
        <div className='flex items-center gap-2'>
          <FormatPrice
            number={formatBalance(
              orderDetail?.matchAmount,
              orderDetail?.token0Decimal
            )}
          />
          {tokenDetail?.data?.tokenSymbol}
        </div>
      ),
    },
    {
      title: (
        <div className='flex items-center gap-2 text-sm font-bold text-secondary'>
          Remaining
          <CustomTooltip
            color='#0d1255'
            title={
              <div className='text-center font-semibold text-white'>
                Total amount left in the order.
              </div>
            }
          >
            <IconInfo />
          </CustomTooltip>
        </div>
      ),
      value: (
        <div className='flex items-center gap-2'>
          <FormatPrice
            number={formatBalance(
              orderDetail?.remainAmount,
              orderDetail?.token0Decimal
            )}
          />
          {tokenDetail?.data?.tokenSymbol}
        </div>
      ),
    },
    {
      title: (
        <div className='flex items-center gap-2 text-sm font-bold text-secondary'>
          Order Creator
        </div>
      ),
      value: <div>{formatWallet(orderDetail?.orderCreator) || '--'}</div>,
    },
  ];

  return (
    <div className='flex flex-col gap-6 border-b border-stroke p-6 text-white'>
      <div className='flex items-center gap-2 text-[24px] font-bold'>
        <CustomImage
          width={32}
          height={32}
          src={tokenDetail?.data?.logo}
          alt='stb'
          className='rounded-full'
        />
        {tokenDetail?.data?.tokenSymbol}/{currency}
      </div>
      <Collapse
        defaultActiveKey={['0']}
        ghost
        expandIconPosition='end'
        className='relative box-border flex w-full flex-col items-start justify-center gap-6 rounded-2xl bg-[#141a36] p-6 text-left shadow-[0px_0px_16px_rgba(29,_23,_84,_0.1)]'
        expandIcon={({ isActive }) => (
          <IconArrowDown
            className={`mt-4 transition-all duration-300 ${isActive && 'rotate-180'}`}
          />
        )}
      >
        <Panel
          header={
            <div className='w-full text-[24px] font-bold text-white'>
              General Info.
            </div>
          }
          className='filter-header'
          key='1'
        >
          <div className='grid w-full grid-cols-2 gap-2 font-bold sm:grid-cols-4'>
            {dataInfo?.map((item: any, index: any) => (
              <div key={index}>
                {item?.title}
                <div className='text-white'>{item?.value}</div>
              </div>
            ))}
          </div>
        </Panel>
      </Collapse>
      <div className='flex items-center gap-2 text-[24px] font-bold capitalize'>
        {type} {tokenDetail?.data?.tokenSymbol}
      </div>
      <div
        className={`relative flex ${type == 'buy' ? 'flex-col-reverse' : 'flex-col'} gap-2`}
      >
        <div className='relative box-border flex w-full flex-col items-start justify-center rounded-2xl bg-[#141a36] p-6 text-left shadow-[0px_0px_16px_rgba(29,_23,_84,_0.1)]'>
          <div className='flex w-full justify-between font-bold text-secondary'>
            {type == 'sell' ? 'Sell' : 'Pay'}
            <div className='flex items-center gap-2'>
              Balance:{' '}
              <div className='text-primary'>
                <FormatPrice
                  number={
                    (type == 'sell' ? balanceToken : balanceNativeToken) || 0
                  }
                />
                {type == 'sell'
                  ? ` ${tokenDetail?.data?.tokenSymbol}`
                  : ` ${currency}`}
              </div>
            </div>
          </div>
          <div className='relative flex w-full flex-col gap-2'>
            <div className='relative box-border flex h-[40px] w-full shrink-0 flex-row items-center justify-between overflow-hidden rounded-xl bg-[#141a36] text-center text-sm'>
              <NumericFormat
                decimalScale={7}
                className='!w-[100%] !bg-transparent text-[38px] font-semibold outline-none'
                placeholder={'Amount'}
                value={input}
                thousandSeparator
                onValueChange={(values, sourceInfo) => {
                  handleChangeInput(values.floatValue, sourceInfo.event);
                }}
                disabled={typeMatch == 'FULL'}
              />
              <div className='flex flex-row items-start justify-start gap-[8px] text-primary'>
                {type == 'sell' ? (
                  <CustomImage
                    width={40}
                    height={40}
                    src={tokenDetail?.data?.logo}
                    alt='stb'
                    className='rounded-full'
                  />
                ) : (
                  <TokenImage width={40} height={40} />
                )}
              </div>
            </div>
            {typeMatch == 'PARTIAL' && (
              <div className='relative flex w-full flex-row items-center justify-start gap-2 text-left text-base'>
                <div
                  onClick={() => handleSetQuick(0.25)}
                  className='flex cursor-pointer flex-row items-center justify-center overflow-hidden rounded-2xl bg-[#050b25] px-5 py-3'
                >
                  <b className='relative leading-[24px]'>25%</b>
                </div>
                <div
                  onClick={() => handleSetQuick(0.5)}
                  className='flex cursor-pointer flex-row items-center justify-center overflow-hidden rounded-2xl bg-[#050b25] px-5 py-3'
                >
                  <b className='relative leading-[24px]'>50%</b>
                </div>
                <div
                  onClick={() => handleSetQuick(0.75)}
                  className='flex cursor-pointer flex-row items-center justify-center overflow-hidden rounded-2xl bg-[#050b25] px-5 py-3'
                >
                  <b className='relative leading-[24px]'>75%</b>
                </div>
                <div
                  onClick={() => handleSetQuick(1)}
                  className='flex cursor-pointer flex-row items-center justify-center overflow-hidden rounded-2xl bg-[#050b25] px-5 py-3'
                >
                  <b className='relative leading-[24px]'>Max</b>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className='relative box-border flex w-full flex-col items-start justify-center rounded-2xl bg-[#141a36] p-6 text-left shadow-[0px_0px_16px_rgba(29,_23,_84,_0.1)]'>
          <div className='flex w-full justify-between font-bold text-secondary'>
            {type == 'buy' ? 'Buy' : 'For'}
          </div>
          <div className='relative box-border flex h-[40px] w-full shrink-0 flex-row items-center justify-between overflow-hidden rounded-xl bg-[#141a36] text-center text-sm'>
            <NumericFormat
              decimalScale={7}
              className='!w-[100%] !bg-transparent text-[38px] font-semibold outline-none'
              placeholder={'Amount'}
              value={output}
              thousandSeparator
              disabled={typeMatch == 'FULL'}
              // disabled
              onValueChange={(values, sourceInfo) => {
                handleChangeOutput(values.floatValue, sourceInfo.event);
              }}
            />
            <div className='flex flex-row items-start justify-start gap-[8px] text-primary'>
              {type == 'buy' ? (
                <CustomImage
                  width={40}
                  height={40}
                  src={tokenDetail?.data?.logo}
                  alt='stb'
                  className='rounded-full'
                />
              ) : (
                <TokenImage width={40} height={40} />
              )}
            </div>
          </div>
        </div>
      </div>
      <div className='text-neural-200 font-medium-24 relative box-border flex w-full flex-col items-start justify-start gap-1 rounded-2xl bg-[#141a36] p-6 text-left text-base'>
        {/* <div className='flex flex-row items-center justify-between self-stretch'>
          <div className='relative font-semibold leading-[24px]'>Balance:</div>
          <div className='text-primary relative font-semibold leading-[24px]'>
            2,500,000 {tokenDetail?.data?.tokenSymbol}
          </div>
        </div> */}
        <div className='flex flex-row items-center justify-between self-stretch'>
          <div className='relative font-semibold leading-[24px]'>You pay:</div>
          <div className='relative font-semibold leading-[24px] text-primary'>
            {input}{' '}
            {type == 'sell' ? tokenDetail?.data?.tokenSymbol : `${currency}`}
          </div>
        </div>
        <div className='flex flex-row items-center justify-between self-stretch'>
          <div className='relative font-semibold leading-[24px]'>
            You receive:
          </div>
          <div className='relative font-semibold leading-[24px] text-primary'>
            {output}{' '}
            {type == 'buy' ? tokenDetail?.data?.tokenSymbol : `${currency}`}
          </div>
        </div>
      </div>
      <Button
        loading={loading}
        onClick={() => handleConfirmOrder()}
        disabled={
          !input || currentConnectedAccount == orderDetail?.orderCreator
        }
        className='btn-primary w-full'
      >
        Confirm
      </Button>
    </div>
  );
};
export default TradeToken;
