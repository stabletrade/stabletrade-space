import React, { useEffect, useState } from 'react';
import CustomModal from '../custom/CustomModal';
import CustomImage from '@/components/custom/CustomImage';
import { useRouter } from 'next/navigation';
import { Button } from 'antd';
import { handleCopy } from '@/utils';

const ModalInviteFriend = ({ open, onCancel, refCode }: any) => {
  const router = useRouter();
  const [copy, setCopy] = useState(false);
  return (
    <CustomModal open={open} onCancel={onCancel} width={450}>
      <div className='flex flex-col items-center rounded-xl p-[40px] gap-4 text-primary'>
        <CustomImage
          src='/images/event/otx.webp'
          alt='err'
          width={72}
          height={72}
        />
        <div className='text-[24px] font-extrabold'>
          Invite to Earn 100 $OTX
        </div>
        <div className='flex flex-col text-sm'>
          Know someone that would love StableTrade?
          <div>Invite them and get 100 $OTX when they join us</div>
        </div>
        <div className='bg-[#141a36] font-regular-24 relative box-border flex w-full flex-col items-start justify-start rounded-3xl px-5 py-3 text-left text-base text-primary shadow-[0px_0px_16px_rgba(29,_23,_84,_0.1)]'>
          <div className='relative font-medium leading-[24px]'>
            {`https://stabletrade.space//event?ref=${refCode}`}
          </div>
        </div>
        <div className='mt-4 w-full gap-4'>
          <Button
            onClick={() => handleCopy(`https://stabletrade.space//event?ref=${refCode}`)}
            className='btn-primary w-full !rounded-full'
          >
            Copy Link
          </Button>
          {/* <Button onClick={() => onCancel()} className='btn-primary w-full'>
            Done
          </Button> */}
        </div>
      </div>
    </CustomModal>
  );
};

export default ModalInviteFriend;
