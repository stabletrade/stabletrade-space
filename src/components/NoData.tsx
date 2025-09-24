import React from 'react';
import CustomImage from './custom/CustomImage';
import { DEFAULT_IMAGE } from '@/constant';
import useStore from '@/store';
import { useParams, usePathname } from 'next/navigation';
import { useGetTokenDetail } from '@/hook/queries/useGetListToken';

const NoData = () => {
  const setShowModalCreateOffer = useStore(
    (state) => state.setShowModalCreateOffer
  );
  const setSelectedToken = useStore((state) => state.setSelectedToken);
  const pathname = usePathname();
  const params = useParams();
  const { data: tokenDetail, isLoading: isLoadingBuy } = useGetTokenDetail({
    tokenAddress: params?.id,
    open: !!pathname?.includes('/token/'),
  });
  return (
    <div className='flex flex-col items-center py-20'>
      <CustomImage src={DEFAULT_IMAGE} alt='No Data' width={100} height={100} />
      <p className='mt-[1rem] text-[24px]'>No data found!</p>
      {pathname?.includes('/token/') && (
        <p
          onClick={() => {
            setSelectedToken(tokenDetail?.data);
            setShowModalCreateOffer(true);
          }}
          className='mt-[1rem] cursor-pointer text-[24px] underline'
        >
          Create your own order now!
        </p>
      )}
    </div>
  );
};

export default NoData;
