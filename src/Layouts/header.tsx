import IconLoading from '@/assets/icons/IconLoading';
import IconSearch from '@/assets/icons/IconSearch';
import CustomButton from '@/components/custom/CustomButton';
import CustomImage from '@/components/custom/CustomImage';
import CustomInput from '@/components/custom/CustomInput';
import NoData from '@/components/NoData';
import { CHAIN, DEFAULT_IMAGE, APTOS_APT_ADDRESS } from '@/constant';
import { useGetTokenPrice } from '@/hook/queries/useGetListToken';
import { useImportToken, useQuoteToken } from '@/hook/queries/useQuoteToken';
import useApplication from '@/hook/useApplication';
import useClickOutSide from '@/hook/useClickOutSide';
import useDebounce from '@/hook/useDebounce';
import useStore from '@/store';
import { formatWallet } from '@/utils';

import { WalletSelector } from '@aptos-labs/wallet-adapter-ant-design';
import { Button, Drawer, Menu } from 'antd';
import { MenuOutlined, CloseOutlined } from '@ant-design/icons';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
export const CHAIN_TYPE_KEY = 'currentActiveChain';

const Header = () => {
  const currentActiveChain = useStore((state) => state.currentActiveChain);
  const setCurrentActiveChain = useStore(
    (state) => state.setCurrentActiveChain
  );
  const showModalConnectWallet = useStore(
    (state) => state.showModalConnectWallet
  );
  const setShowModalConnectWallet = useStore(
    (state) => state.setShowModalConnectWallet
  );
  const [isShowSearch, setIsShowSearch] = React.useState(false);
  const [showMenu, setShowMenu] = React.useState(false);
  const [drawerVisible, setDrawerVisible] = React.useState(false);
  const router = useRouter();
  const { ref } = useClickOutSide({
    action: () => {
      setShowMenu(false);
    },
  });

  const { ref: searchRef } = useClickOutSide({
    action: () => {
      setIsShowSearch(false);
    },
  });

  const isAuthenticated = useStore((state) => state.isAuthenticated);

  const currentConnectedAccount = useStore(
    (state) => state.currentConnectedAccount
  );

  const { handleLogout } = useApplication();
  const pathname = usePathname();

  const MENU_LIST = [
    {
      key: 'trade',
      title: 'Trade',
      link: '/',
    },
    {
      key: 'explore',
      title: 'Explore',
      link: '/explore',
    },

    // {
    //   key: 'reward',
    //   title: 'Reward',
    //   link: '/reward',
    // },
    // {
    //   key: 'stake',
    //   title: 'Stake',
    //   link: '/stake',
    // },
    // {
    //   key: 'dashboard',
    //   title: 'Dashboard',
    //   link: '/dashboard',
    // },
  ];

  const setaptPrice = useStore((state: any) => state.setaptPrice);
  const [searchValue, setSearchValue] = React.useState();
  const [loadingToken, setLoadingToken] = React.useState();
  const setSelectedToken = useStore((state) => state.setSelectedToken);

  const { data: aptPrice } = useGetTokenPrice({
    tokenAddress: APTOS_APT_ADDRESS,
  });

  useEffect(() => {
    aptPrice?.data?.priceInUsd && setaptPrice(aptPrice?.data?.priceInUsd);
  }, [aptPrice]);

  const {
    isLoading: loadingQuoteToken,
    data: quoteTokenList,
    refetch: refetchQuoteTokenList,
  } = useQuoteToken({
    open: isShowSearch,
    search: searchValue,
  });
  const { mutateAsync, isPending } = useImportToken();

  const handleSelectToken = async (item: any) => {
    if (item?.available) {
      setSelectedToken(item);
      setIsShowSearch(false);
      router.push(`/token/${item?.contractAddress}`);
    }
  };

  const handleAddToken = async (item: any) => {
    setLoadingToken(item?.contractAddress);
    await mutateAsync(item?.contractAddress);
    refetchQuoteTokenList();
  };

  const debounceSearch = useDebounce(async (value: any) => {
    setSearchValue(value);
  }, 300);

  const handleSearchToken = async (e: any) => {
    setIsShowSearch(true);
    debounceSearch(e.target.value);
  };

  useEffect(() => {
    setCurrentActiveChain(CHAIN.APTOS);
  }, []);

  return (
    <div className='sticky top-0 z-[5] h-[75px] w-full bg-white px-6 py-3'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-[40px]'>
          <button
            onClick={() => {
              router.push('/');
            }}
            className='flex items-center gap-1 text-base font-extrabold text-[#141A36]'
          >
            <CustomImage width={73} height={38} alt='' src={"/images/otc_logo.png"} />
            <div className='uppercase max-sm:hidden'>stabletrade</div>
          </button>

          <div className='flex items-center max-lg:hidden'>
            {MENU_LIST.map((item) => (
              <button
                onClick={() => {
                  router.push(item.link);
                }}
                key={item?.key}
                className={`px-[20px] font-bold ${pathname == item?.link ? 'text-[#1854ce]' : 'text-[#141A36]'}`}
              >
                {item?.title}
              </button>
            ))}
          </div>
        </div>

        <CustomInput
          onChange={handleSearchToken}
          onFocus={() => {
            setIsShowSearch(true);
            if (!searchValue) {
              return;
            }
          }}
          placeholder='Search'
          prefix={<IconSearch />}
          className='header-search-input explore-search-input w-[407px] gap-[10px] rounded-none border-none !bg-[#141a36] py-[12px] !text-white max-lg:hidden'
        />

        {isShowSearch && (
          <div
            ref={searchRef}
            className='fixed left-1/2 top-[4.5rem] inline-flex h-[400px] w-[532px] -translate-x-1/2 flex-col items-start justify-start gap-[20px] rounded-3xl bg-[#050b25] p-4 shadow-2xl'
          >
            <div className='w-full overflow-y-auto'>
              {loadingQuoteToken && (
                <IconLoading className='m-auto mt-32 animate-spin' />
              )}
              {quoteTokenList?.data?.rows?.length > 0
                ? quoteTokenList?.data?.rows?.map((item: any) => (
                  <button
                    onClick={() => {
                      handleSelectToken(item);
                    }}
                    key={item?.id}
                    className='flex h-[72px] w-full items-center justify-between gap-1 rounded-2xl px-5 py-3 transition-all hover:!bg-[#141a36] hover:shadow-[0px_0px_16px_0px_rgba(29,23,84,0.10)]'
                  >
                    <div className='inline-flex items-center justify-start gap-1.5'>
                      <CustomImage
                        alt='err'
                        src={item?.logo}
                        className='rounded-full'
                        width={48}
                        height={48}
                      />
                      <div className='inline-flex flex-col items-start justify-center'>
                        <div className='inline-flex items-start justify-start gap-2'>
                          <div className="font-['Archivo'] text-base font-bold leading-normal text-white">
                            {item?.tokenName}
                          </div>
                          <div className="font-['Archivo'] text-base font-medium leading-normal text-[#788ad0]">
                            {item?.tokenSymbol}
                          </div>
                        </div>
                        <div className="font-['Archivo'] text-base font-medium leading-normal text-[#788ad0]">
                          {formatWallet(item?.contractAddress)}
                        </div>
                      </div>
                    </div>
                    {!item?.available && (
                      <CustomButton
                        onClick={() => {
                          handleAddToken(item);
                        }}
                        loading={
                          isPending && loadingToken === item?.contractAddress
                        }
                      >
                        Add
                      </CustomButton>
                    )}
                  </button>
                ))
                : !loadingQuoteToken && <NoData />}
            </div>
          </div>
        )}

        <div className='flex items-center gap-2'>
          {/* <CustomSelect
            options={CHAIN_OPTIONS}
            value={currentActiveChain}
            // onChange={(e) => {
            //   handleLogout();
            //   setCurrentActiveChain(e);
            // }}
            // className='h-full w-full'
            // dropdownStyle={{ zIndex: 10000 }}
          /> */}
          <Button
            className={`${'btn-white'} clip-path-btn !rounded-none max-lg:hidden`}
          >
            <CustomImage
              width={23}
              height={23}
              src={'/images/wallet/aptos_white.png'}
              alt='aptos'
              className='min-w-[23px]'
            />
            <div className='flex flex-col items-center'>
              <span className='font-medium leading-6 text-white'>Aptos</span>
            </div>
          </Button>

          

          {isAuthenticated ? (
            <>
              <Button
                onClick={() => {
                  setShowMenu(!showMenu);
                }}
                className='btn-primary clip-path-btn !rounded-none'
              >
                {formatWallet(currentConnectedAccount)}
              </Button>
              {showMenu && (
                <div
                  ref={ref}
                  className='fixed right-[1rem] top-[4.5rem] inline-flex h-[114px] w-[145px] flex-col items-start justify-start gap-1.5 rounded-2xl bg-[#050b25] p-1.5 shadow-[0px_0px_16px_0px_rgba(29,23,84,0.10)]'
                >
                  <button
                    onClick={() => {
                      router.push('/my-profile');
                      setShowMenu(false);
                    }}
                    className='clip-path-btn inline-flex items-center justify-start gap-1.5 self-stretch bg-[#141a36] p-3 hover:bg-[#050b25]'
                  >
                    <div className="font-['Archivo'] text-base font-bold leading-normal text-white">
                      My Profile
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      handleLogout();
                      setShowMenu(false);
                    }}
                    className='clip-path-btn inline-flex items-center justify-start gap-1.5 self-stretch bg-[#141a36] p-3 hover:bg-[#050b25]'
                  >
                    <div className="font-['Archivo'] text-base font-bold leading-normal text-[#e42051]">
                      Disconnect
                    </div>
                  </button>
                </div>
              )}
            </>
          ) : (
            <WalletSelector />
          )}

          {/* Mobile Menu Button */}
          <Button
            onClick={() => setDrawerVisible(true)}
            className='lg:hidden !border-none !bg-transparent !shadow-none !p-2'
            icon={<MenuOutlined className='text-[#141A36] text-xl' />}
          />
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <Drawer
        title={
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-[#141A36]">Menu</span>
            <Button
              onClick={() => setDrawerVisible(false)}
              className="drawer-close-icon !border-none !bg-transparent !shadow-none !p-1"
              icon={<CloseOutlined className="text-lg" />}
            />
          </div>
        }
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={280}
        className="mobile-drawer"
        bodyStyle={{ padding: '24px 0' }}
        closable={false}
      >
        <div className="flex flex-col h-full">
          {/* Aptos Button */}
          <div className="px-6 pb-4 border-b border-gray-200">
            <Button
              className={`${'btn-white'} clip-path-btn !rounded-none w-full cursor-default`}
            >
              <CustomImage
                width={23}
                height={23}
                src={'/images/wallet/aptos_white.png'}
                alt='aptos'
                className='min-w-[23px]'
              />
              <div className='flex flex-col items-center'>
                <span className='font-medium leading-6 text-white'>Aptos</span>
              </div>
            </Button>
          </div>

          {/* Menu Items */}
          <div className="flex-1 px-6 pt-4">
            <Menu
              mode="vertical"
              selectedKeys={[pathname]}
              className="border-none bg-transparent"
            >
              {MENU_LIST.map((item) => (
                <Menu.Item
                  key={item.link}
                  onClick={() => {
                    router.push(item.link);
                    setDrawerVisible(false);
                  }}
                  className={`px-[20px] font-bold ${pathname == item?.link ? '!text-[#1854ce]' : 'text-[#141A36]'}`}
                >
                  {item.title}
                </Menu.Item>
              ))}
            </Menu>
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export default Header;
