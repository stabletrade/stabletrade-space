import { CHAIN } from '@/constant';
import CustomImage from './custom/CustomImage';
import useStore from '@/store';

const TokenImage = ({ width = 24, height = 24 }: any) => {
  const currentActiveChain = useStore((state) => state.currentActiveChain);
  return (
    <CustomImage
      className='relative aspect-square rounded-[50%] object-cover'
      width={width}
      height={height}
      alt=''
      src={'/images/wallet/aptos_white.png'}
    />
  );
};
export default TokenImage;
