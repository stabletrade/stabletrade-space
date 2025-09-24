import FormatPrice from '@/components/FormatPrice';
import TokenImage from '@/components/TokenImage';
import TableTrade from '@/components/table/TableTrade';
import {
  APTOS_APT_ADDRESS,
  CHAIN,
  ORDER_MATCH_TYPE,
  ORDER_TYPE,
  PRICE_TYPE,
} from '@/constant';
import {
  useGetListActivities,
  useGetListOrder,
} from '@/hook/queries/useGetListOrder';
import { useGetTokenDetail } from '@/hook/queries/useGetListToken';
import useStore from '@/store';
import { delay, formatBalance, formatWallet, getTokenCurrency } from '@/utils';
import { toastError, toastSuccess } from '@/utils/toast';
import { Button } from 'antd';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import moment from 'moment';
import CustomImage from '@/components/custom/CustomImage';
import Link from 'next/link';
import IconTxs from '@/assets/icons/IconTxs';
import CustomSelect from '@/components/custom/CustomSelect';
import useAptos from '@/hook/useAptos';
const ListOrder = () => {
  const setOrderDetail = useStore((state) => state.setOrderDetail);
  const orderDetail = useStore((state: any) => state.orderDetail);

  const currentConnectedAccount = useStore(
    (state) => state.currentConnectedAccount
  );
  const [loadingCancel, setLoadingCancel] = useState<any>(false);

  const params = useParams();
  const { cancelOfferAptos } = useAptos();

  const { data: tokenDetail } = useGetTokenDetail({
    tokenAddress: params?.id,
  });

  const aptPrice = useStore((state: any) => state.aptPrice);

  const tradeColumnBuy = [
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (value: any, record: any, index: any) => (
        <div className='flex gap-2 font-semibold text-primary'>
          <TokenImage />
          <FormatPrice
            number={formatBalance(
              record?.priceType == PRICE_TYPE.FIXED ? value : value / aptPrice
            )}
          />
          {currency}
        </div>
      ),
    },
    {
      title: 'Available Amount',
      dataIndex: 'remainAmount',
      key: 'remainAmount',
      render: (value: any, record: any, index: any) => (
        <div className='flex gap-2 font-semibold text-primary'>
          <CustomImage
            width={24}
            height={24}
            src={record?.token0Logo}
            alt='stb'
            className='rounded-full'
          />
          <FormatPrice number={formatBalance(value, record?.token0Decimal)} />
          {record?.symbol}
        </div>
      ),
    },
    {
      title: 'Match Type',
      dataIndex: 'matchType',
      key: 'matchType',
      render: (value: any, record: any, index: any) => (
        <div>{ORDER_MATCH_TYPE[value]}</div>
      ),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (value: any, record: any, index: any) =>
        currentConnectedAccount != record?.orderCreator ? (
          <Button
            onClick={() => setOrderDetail(record)}
            className='btn-primary !h-[36px] !rounded-lg !bg-blue-500'
          >
            Buy
          </Button>
        ) : (
          <Button
            loading={loadingCancel && record?.orderId == orderDetail?.orderId}
            onClick={() => {
              setOrderDetail(record);
              handleCancelOffer({
                tokenAddress: record?.token0Address,
                offerId: Number(record?.orderId),
                type: 'buy',
              });
            }}
            className='btn-white !h-[36px] !rounded-lg'
          >
            Cancel
          </Button>
        ),
    },
  ];
  const tradeColumnSell = [
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (value: any, record: any, index: any) => (
        <div className='flex gap-2 font-semibold text-primary'>
          <TokenImage />
          <FormatPrice
            number={formatBalance(
              record?.priceType == PRICE_TYPE.FIXED ? value : value / aptPrice
            )}
          />
          {currency}
        </div>
      ),
    },
    {
      title: 'Available Amount',
      dataIndex: 'remainAmount',
      key: 'remainAmount',
      render: (value: any, record: any, index: any) => (
        <div className='flex gap-2 font-semibold text-primary'>
          <CustomImage 
            width={24}
            height={24}
            src={record?.token0Logo}
            alt='stb'
            className='rounded-full'
          />
          <FormatPrice number={formatBalance(value, record?.token0Decimal)} />
          {record?.token0Symbol}
        </div>
      ),
    },
    {
      title: 'Match Type',
      dataIndex: 'matchType',
      key: 'matchType',
      render: (value: any, record: any, index: any) => (
        <div>{ORDER_MATCH_TYPE[value]}</div>
      ),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (value: any, record: any, index: any) =>
        currentConnectedAccount != record?.orderCreator ? (
          <Button
            onClick={() => setOrderDetail(record)}
            className='btn-secondary !h-[36px] !rounded-lg'
          >
            Sell
          </Button>
        ) : (
          <Button
            loading={loadingCancel && record?.orderId == orderDetail?.orderId}
            onClick={() => {
              setOrderDetail(record);
              handleCancelOffer({
                tokenAddress: record?.token0Address,
                offerId: Number(record?.orderId),
                type: 'sell',
              });
            }}
            className='btn-white !h-[36px] !rounded-lg'
          >
            Cancel
          </Button>
        ),
    },
  ];
  const txsColumn = [
    {
      title: 'Time',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (value: any, record: any, index: any) => (
        <div>{moment(value).format('YYYY-MM-DD HH:mm')}</div>
      ),
    },
    {
      title: `${tokenDetail?.data?.tokenSymbol}`,
      dataIndex: 'token0Amount',
      key: 'token0Amount',
      render: (value: any, record: any, index: any) => (
        <div className='flex gap-2 font-semibold text-primary'>
          <CustomImage
            className='relative rounded-[50%] object-cover'
            width={24}
            height={2}
            alt=''
            src={tokenDetail?.data?.logo}
          />{' '}
          <FormatPrice number={formatBalance(value, record?.token0Decimal)} />
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'orderType',
      key: 'orderType',
      render: (value: any, record: any, index: any) => (
        <div
          className={`relative box-border flex w-[60px] flex-row items-center justify-center rounded-xl px-2 py-1 text-left text-xs ${ORDER_TYPE[value] == 'BUY' ? 'bg-[#bcf8cc] text-success' : 'bg-[#FFB1B7] text-error'}`}
        >
          <p className='relative font-bold leading-[18px]'>
            {ORDER_TYPE[value]}
          </p>
        </div>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (value: any, record: any, index: any) => (
        <div className='flex gap-2 font-semibold text-primary'>
          <TokenImage />
          <div className='flex items-center gap-1'>
            <FormatPrice
              number={formatBalance(
                record?.typeOrder == PRICE_TYPE?.FIXED
                  ? value
                  : value / aptPrice
              )}
            />{' '}
            {currency}
          </div>
        </div>
      ),
    },
    // {
    //   title: 'Volume',
    //   dataIndex: 'volume',
    //   key: 'volume',
    //   render: (value: any, record: any, index: any) => (
    //     <FormatPrice number={value} prefix='$' />
    //   ),
    // },
    {
      title: 'Wallet',
      dataIndex: 'orderCreator',
      key: 'orderCreator',
      render: (value: any, record: any, index: any) => (
        <div className={`text-error`}>{formatWallet(value)}</div>
      ),
    },
    {
      title: 'Transaction',
      dataIndex: 'transactionHash',
      key: 'transactionHash',
      render: (value: any, record: any, index: any) => (
        <Link
          target='_blank'
          rel='noreferrer'
          href={`https://explorer.aptoslabs.com/txn/${value}`}
        >
          <IconTxs />
        </Link>
      ),
    },
  ];

  const [paramSearchBuy, setParamSearchBuy] = useState({
    page: 1,
    limit: 10,
    sortField: 'price',
    orderBy: 'DESC',
  } as any);

  const [paramSearchSell, setParamSearchSell] = useState({
    page: 1,
    limit: 10,
    sortField: 'price',
    orderBy: 'DESC',
  } as any);

  const [paginationActivities, setPaginationActivities] = useState({
    page: 1,
    limit: 10,
  });

  const {
    data: listBuyOrderData,
    isLoading: isLoadingBuy,
    refetch: refetchBuy,
  } = useGetListOrder({
    tokenAddress: params?.id,
    ...paramSearchBuy,
    orderType: ORDER_TYPE.SELL,
    enabled: !!params?.id,
  });

  const {
    data: listSellOrderData,
    isLoading: isLoadingSell,
    refetch: refetchSell,
  } = useGetListOrder({
    tokenAddress: params?.id,
    ...paramSearchSell,
    orderType: ORDER_TYPE.BUY,
    enabled: !!params?.id,
  });

  const token1Address = APTOS_APT_ADDRESS;

  const {
    data: listActivities,
    isLoading: isLoadingActivities,
    refetch: refetchActivities,
  } = useGetListActivities({
    token0: params?.id,
    token1: token1Address,
    // networkType: tokenDetail?.data?.networkType,
    ...paginationActivities,
  });

  const onChangePaginationBuy = (page: number, pageSize: number) => {
    setParamSearchBuy({
      ...paramSearchBuy,
      page: page,
    });
  };

  const onChangePaginationSell = (page: number, pageSize: number) => {
    setParamSearchSell({
      ...paramSearchSell,
      page: page,
    });
  };

  const onChangePaginationActivities = (page: number, pageSize: number) => {
    setPaginationActivities({
      ...paginationActivities,
      page: page,
    });
  };

  const handleCancelOffer = async (params: any) => {
    try {
      setLoadingCancel(true);
      let res = undefined as any;
      if (currentActiveChain == CHAIN.APTOS) {
        res = await cancelOfferAptos(params);
      }

      if (res) {
        await delay(5000);
        toastSuccess('Cancel Offer Success!');
        if (params?.type == 'buy') {
          await refetchBuy();
        } else {
          refetchSell();
        }
      }
    } catch (error: any) {
      toastError(error || error?.message);
    } finally {
      setLoadingCancel(false);
    }
  };

  const currentActiveChain = useStore((state) => state.currentActiveChain);
  const currency = getTokenCurrency(currentActiveChain);
  return (
    <div>
      <div className='grid border-x border-stroke max-sm:grid-cols-1 sm:grid-cols-2'>
        <div className='border-r border-stroke p-6'>
          <div className='relative mb-4 flex w-full justify-between text-left text-[24px] font-extrabold leading-[32px] max-sm:flex-col max-sm:gap-2'>
            <div>Buy {tokenDetail?.data?.tokenSymbol}</div>
            <div className='flex items-center gap-2'>
              <CustomSelect
                // data-aos='fade-up'
                // data-aos-delay={600}
                options={[
                  {
                    value: 'DESC',
                    label: 'Sort by: Highest Price',
                  },
                  {
                    value: 'ASC',
                    label: 'Sort by: Lowest Price',
                  },
                ]}
                value={paramSearchBuy?.orderBy}
                onChange={(value: any) => {
                  setParamSearchBuy({
                    ...paramSearchBuy,
                    sortField: 'price',
                    orderBy: value,
                  });
                }}
              />
              <CustomSelect
                // data-aos='fade-up'
                // data-aos-delay={400}
                placeholder='Match Type'
                options={[
                  { value: ORDER_MATCH_TYPE.FULL, label: 'Match Type: Full' },
                  {
                    value: ORDER_MATCH_TYPE.PARTIAL,
                    label: 'Match Type: Partial',
                  },
                ]}
                value={paramSearchBuy?.matchType}
                onChange={(value: any) => {
                  setParamSearchBuy({
                    ...paramSearchBuy,
                    matchType: value,
                  });
                }}
              />
            </div>
          </div>
          <TableTrade
            columns={tradeColumnBuy}
            dataSource={listBuyOrderData?.data?.rows}
            scroll={{ x: 400 }}
            rowClassName={(record, index) =>
              record?.orderId == orderDetail?.orderId ? 'bg-[#141a36]' : ''
            }
            pagination={{
              current: paramSearchBuy?.page,
              pageSize: 10,
              onChange: onChangePaginationBuy,
              total: listBuyOrderData?.data?.totalCount,
            }}
            loading={isLoadingBuy}
          />
        </div>
        <div className='border-r border-stroke p-6'>
          <div className='relative mb-4 flex w-full justify-between text-left text-[24px] font-extrabold leading-[32px] max-sm:flex-col max-sm:gap-2'>
            <div>Sell {tokenDetail?.data?.tokenSymbol}</div>
            <div className='flex items-center gap-2'>
              <CustomSelect
                // data-aos='fade-up'
                // data-aos-delay={600}
                options={[
                  {
                    value: 'DESC',
                    label: 'Sort by: Highest Price',
                  },
                  {
                    value: 'ASC',
                    label: 'Sort by: Lowest Price',
                  },
                ]}
                value={paramSearchSell?.orderBy}
                onChange={(value: any) => {
                  setParamSearchSell({
                    ...paramSearchSell,
                    sortField: 'price',
                    orderBy: value,
                  });
                }}
              />
              <CustomSelect
                // data-aos='fade-up'
                // data-aos-delay={400}
                placeholder='Match Type'
                options={[
                  { value: ORDER_MATCH_TYPE.FULL, label: 'Match Type: Full' },
                  {
                    value: ORDER_MATCH_TYPE.PARTIAL,
                    label: 'Match Type: Partial',
                  },
                ]}
                value={paramSearchSell?.matchType}
                onChange={(value: any) => {
                  setParamSearchSell({
                    ...paramSearchSell,
                    matchType: value,
                  });
                }}
              />
            </div>
          </div>
          <TableTrade
            columns={tradeColumnSell}
            dataSource={listSellOrderData?.data?.rows}
            scroll={{ x: 'max-content' }}
            rowClassName={(record, index) =>
              record?.orderId == orderDetail?.orderId ? 'bg-[#141a36]' : ''
            }
            pagination={{
              current: paramSearchSell?.page,
              pageSize: 10,
              onChange: onChangePaginationSell,
              total: listSellOrderData?.data?.totalCount,
            }}
            loading={isLoadingSell}
          />
        </div>
      </div>
      <div className='border-r border-stroke p-6'>
        <div className='relative mb-4 text-left text-[24px] font-extrabold leading-[32px]'>
          Activities
        </div>
        <TableTrade
          columns={txsColumn}
          dataSource={listActivities?.data?.rows}
          scroll={{ x: 'max-content' }}
          pagination={{
            current: paginationActivities?.page,
            pageSize: 10,
            onChange: onChangePaginationActivities,
            total: listActivities?.data?.totalCount,
          }}
          loading={isLoadingActivities}
        />
      </div>
    </div>
  );
};

export default ListOrder;
