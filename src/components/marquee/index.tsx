import Style from './style.module.css';
import Marquee from 'react-fast-marquee';
const MarqueeRun = () => {
  return (
    <div className={`${Style.marquee} sticky top-0 uppercase`}>
      <Marquee speed={100}>
        <div
          className='ml-8 flex cursor-pointer gap-8 text-primary items-center'
          // href='https://dragark.net/play/'
          // target={'_blank'}
          // rel='noreferrer'
        >
          <img className='w-[14px] h-[18px]' alt='' src='/images/star.png' />
          Enable 2FA on Braavos for fee-free trading
        </div>
        <div
          className='ml-8 flex cursor-pointer gap-8 text-primary items-center'
          // href='https://dragark.net/play/'
          // target={'_blank'}
          // rel='noreferrer'
        >
          <img className='w-[14px] h-[18px]' alt='' src='/images/star.png' />
          MAJOR UPDATE GOING IN JANUARY
        </div>
        <div
          className='ml-8 flex cursor-pointer gap-8 text-primary items-center'
          // href='https://dragark.net/play/'
          // target={'_blank'}
          // rel='noreferrer'
        >
          <img className='w-[14px] h-[18px]' alt='' src='/images/star.png' />
          Enable 2FA on Braavos for fee-free trading
        </div>
        <div
          className='ml-8 flex cursor-pointer gap-8 text-primary items-center'
          // href='https://dragark.net/play/'
          // target={'_blank'}
          // rel='noreferrer'
        >
          <img className='w-[14px] h-[18px]' alt='' src='/images/star.png' />
          MAJOR UPDATE GOING IN JANUARY
        </div>
        <div
          className='ml-8 flex cursor-pointer gap-8 text-primary items-center'
          // href='https://dragark.net/play/'
          // target={'_blank'}
          // rel='noreferrer'
        >
          <img className='w-[14px] h-[18px]' alt='' src='/images/star.png' />
          Enable 2FA on Braavos for fee-free trading
        </div>
      </Marquee>
    </div>
  );
};

export default MarqueeRun;
