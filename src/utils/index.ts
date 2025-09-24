import { CHAIN, APTOS_OFFSET } from '@/constant';

export const formatWallet = (address: any) => {
  if (!address) return '';
  return `${address?.slice(0, 5)}...${address?.slice(-4)}`;
};

export const handleCopy = async (text: string, setCopied?: any) => {
  try {
    await navigator.clipboard.writeText(text);
    // setCopied(true);
    // setTimeout(() => setCopied(false), 1000);
  } catch (err) {
    console.error('Failed to copy text: ', err);
  }
};

export const formatTimeUnit = (timeUnit: any) => {
  return timeUnit < 10 ? `0${timeUnit}` : `${timeUnit}`;
};

export const formatSmallNumber = (number: any) => {
  if (!number || number == 0) return 0;
  const num = number?.toFixed(30).replace(/\.?0+$/, '');
  const parts = num.toString().split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1];

  if (!integerPart || !decimalPart) return num;

  const leadingZeros =
    decimalPart.length - decimalPart.replace(/^0+/, '').length;

  if (leadingZeros >= 5) {
    return {
      first: integerPart,
      numberZero: leadingZeros,
      last: decimalPart.replace(/^0+/, '').substring(0, 3),
    };
  } else {
    return number?.toFixed(Math.min(leadingZeros + 4, 5)).replace(/\.?0+$/, '');
  }
};

const ranges = [
  { divider: 1e24, suffix: 'Sept' },
  { divider: 1e21, suffix: 'Sext' },
  { divider: 1e18, suffix: 'Quin' },
  { divider: 1e15, suffix: 'Quad' },
  { divider: 1e12, suffix: 'T' },
  { divider: 1e9, suffix: 'B' },
  { divider: 1e6, suffix: 'M' },
  { divider: 1e3, suffix: 'K' },
];

export const formatBigNumber = (n: any) => {
  for (let i = 0; i < ranges.length; i++) {
    if (n >= ranges[i].divider) {
      // eslint-disable-next-line no-unsafe-optional-chaining
      return (
        Number(n / ranges[i].divider || 0)
          ?.toFixed(2)
          .toString() + ranges[i].suffix
      );
    }
  }
  return n.toString();
};

export const formatBalance = (value: any, decimal = 8) => {
  return Number(value || 0) / (decimal == 8 ? APTOS_OFFSET : 10 ** decimal);
};

export const checkTxsSuccess = (receipt: any) => {
  return (
    receipt?.finality_status == 'ACCEPTED_ON_L2' &&
    receipt?.execution_status == 'SUCCEEDED'
  );
};

export const delay = (delayInms: any) => {
  return new Promise((resolve) => setTimeout(resolve, delayInms));
};

export const getTokenCurrency = (tokenEnum: any = CHAIN.APTOS) => {
  switch (tokenEnum) {
    case CHAIN.APTOS:
      return 'APT';
    default:
      return 'APT';
  }
};

export const openWindowTab = ({ url, title, w, h }: any) => {
  // Fixes dual-screen position                             Most browsers      Firefox
  const dualScreenLeft =
    window.screenLeft !== undefined ? window.screenLeft : window.screenX;
  const dualScreenTop =
    window.screenTop !== undefined ? window.screenTop : window.screenY;

  const width = window.innerWidth
    ? window.innerWidth
    : document.documentElement.clientWidth
      ? document.documentElement.clientWidth
      : window.screen.width;
  const height = window.innerHeight
    ? window.innerHeight
    : document.documentElement.clientHeight
      ? document.documentElement.clientHeight
      : window.screen.height;

  const systemZoom = width / window.screen.availWidth;
  const left = (width - w) / 2 / systemZoom + dualScreenLeft;
  const top = (height - h) / 2 / systemZoom + dualScreenTop;
  window.open(
    url,
    title,
    `
    scrollbars=yes,
    width=${w / systemZoom}, 
    height=${h / systemZoom}, 
    top=${top}, 
    left=${left}
    `
  );
};
