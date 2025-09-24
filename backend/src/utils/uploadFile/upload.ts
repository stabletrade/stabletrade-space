import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorMessageEnum } from '../enum/ErrorMessageEnum';

const ADMIN_WALLET = [

];

export const uploadFiles = async (
  dataUpload: any,
  collectionAddress: string,
  subData,
  walletAddress,
) => {
  try {
    const { fileToUpload, logo } = dataUpload;

    /// Check fileToUpload
    const arrLen = fileToUpload?.length || 0;
    let maxSize = 0;
    if (arrLen > 50) {
      throw new HttpException(ErrorMessageEnum.ERR_7, HttpStatus.BAD_REQUEST);
    }
    for (let index = 0; index < arrLen; index++) {
      const element = fileToUpload[index];
      maxSize += Number(element.size);
      if (
        element.mimetype != 'image/jpeg' &&
        element.mimetype != 'image/png' &&
        element.mimetype != 'image/svg+xml' &&
        element.mimetype != 'image/webp' &&
        element.mimetype != 'image/gif'
      ) {
        throw new HttpException(
          ErrorMessageEnum.ERR_10,
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    if (!ADMIN_WALLET.includes(walletAddress) && maxSize > 52428800) {
      throw new HttpException(ErrorMessageEnum.ERR_8, HttpStatus.BAD_REQUEST);
    }
    /// Check logo
    if (!ADMIN_WALLET.includes(walletAddress) && logo[0].size > 52428800) {
      throw new HttpException(ErrorMessageEnum.ERR_9, HttpStatus.BAD_REQUEST);
    }

    const dataSubJson = JSON.parse(subData);
    const configAsset = [];
    for (let index = 0; index < dataSubJson.length; index++) {
      const element = dataSubJson[index];
      configAsset.push(Number(element.supply));
    }
    return {
      uri:
        'https://' +
        process.env.MINIO_ENDPOINT +
        ':' +
        process.env.MINIO_PORT +
        '/' +
        process.env.MINIO_BUCKET +
        `/otc/${collectionAddress}/`,
      configAsset,
    };
  } catch (error) {
    console.log(error);

    throw new HttpException(
      error.response || ErrorMessageEnum.ERR_2,
      HttpStatus.BAD_REQUEST,
    );
  }
};

export const uploadSingle = async (dataUpload: any, tokenAddress: string) => {
  try {
    const { logo } = dataUpload;
    /// Check logo
    if (logo[0].size > 52428800) {
      throw new HttpException(ErrorMessageEnum.ERR_9, HttpStatus.BAD_REQUEST);
    }

    const fileMime = logo[0].originalname.slice(
      logo[0].originalname.lastIndexOf('.'),
      logo[0].originalname.length,
    );
    return {
      logo:
        'https://' +
        process.env.MINIO_ENDPOINT +
        ':' +
        process.env.MINIO_PORT +
        '/' +
        process.env.MINIO_BUCKET +
        `/otc/${tokenAddress}/logo` +
        fileMime,
      uri:
        'https://' +
        process.env.MINIO_ENDPOINT +
        ':' +
        process.env.MINIO_PORT +
        '/' +
        process.env.MINIO_BUCKET +
        `/otc/${tokenAddress}/uri.json`,
    };
  } catch (error) {
    console.log(error);

    throw new HttpException(
      error.response || ErrorMessageEnum.ERR_2,
      HttpStatus.BAD_REQUEST,
    );
  }
};
