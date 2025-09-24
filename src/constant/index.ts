export const FE_URL = process.env.NEXT_PUBLIC_FE_URL;
export const BE_URL = process.env.NEXT_PUBLIC_BE_URL;

export const DISCORD_CLIENT_ID =
  process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || '1234567890';
export const TWITTER_CLIENT_ID =
  process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID || '1234567890';

export const DEFAULT_IMAGE = '/images/otc_logo_white.png';

export const COLOR_PRIMARY = '#fff';
export const numberRegexQuantity = /^\d+$/;

export enum CHAIN {
  APTOS = 0,
}

export enum ORDER_TYPE {
  BUY,
  SELL,
}

export enum PRICE_TYPE {
  FIXED,
  FLEXIBLE,
}

export enum ORDER_TYPE_FOR_USER {
  SELL,
  BUY,
}

export enum ORDER_MATCH_TYPE {
  PARTIAL,
  FULL,
}

export enum ORDER_STATUS {
  CANCEL,
  ACTIVE,
}

export const ACCESS_TOKEN = 'access_token_otc';
export const REFRESH_TOKEN = 'refresh_token_otc';

export const APTOS_OFFSET = 10 ** 8;

export const APTOS_APT_ADDRESS = '0x1::aptos_coin::AptosCoin';

export const SIGN_MESSAGE =
  'Welcome to StableTrade. By signing this message, you agree with our Terms and Conditions.';
