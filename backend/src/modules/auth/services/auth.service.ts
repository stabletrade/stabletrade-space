import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/services/users.service';
import { PayloadToken } from './../models/token.model';
import config from 'src/config';
import { LoginDto } from '../dto/login.dto';
import { ErrorCodeEnum } from 'src/utils/enum/ErrorMessageEnum';
import { verifySignatureAptos } from 'src/utils/commonFuntion/verifySignature';
import { NetworkTypeEnum } from 'src/utils/enum';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @Inject(config.KEY)
    private configService: ConfigType<typeof config>,
  ) {}

  async validateUser(walletAddress: string, networkType: number) {
    const user = await this.usersService.validateUser(
      walletAddress,
      networkType,
    );
    return user;
  }

  async login(payloads: LoginDto) {
    try {
      if (payloads.networkType !== NetworkTypeEnum.APTOS) {
        throw new HttpException(
          'Only Aptos is supported',
          HttpStatus.BAD_REQUEST,
        );
      }
      const checkSign = verifySignatureAptos(
        payloads.message,
        payloads.signature,
        payloads.publicKey,
      );

      if (!checkSign) {
        throw new HttpException(ErrorCodeEnum.ERR_6, HttpStatus.BAD_REQUEST);
      }
      const checkUser = await this.usersService.validateUser(
        payloads.walletAddress.toLowerCase(),
        payloads.networkType,
      );
      if (!checkUser.referralCode && payloads.refCode) {
        await this.usersService.updateUserRefcode(
          payloads.walletAddress.toLowerCase(),
          payloads.refCode,
        );
      }
      const { accessToken } = this.jwtToken(checkUser);
      const refreshToken = this.jwtRefreshToken(checkUser);

      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async profile(userInfo) {
    try {
      const user = await this.usersService.GetUserProfile(
        userInfo.walletAddress,
      );
      if (!user) {
        throw new HttpException(ErrorCodeEnum.ERR_3, HttpStatus.BAD_REQUEST);
      }
      return user;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  jwtToken(user: PayloadToken) {
    const payload: PayloadToken = {
      id: user.id,
      userName: user.userName,
      walletAddress: user.walletAddress,
    };
    return {
      accessToken: this.jwtService.sign(payload, { expiresIn: '1d' }),
    };
  }

  jwtRefreshToken(user: PayloadToken) {
    const payload: PayloadToken = {
      id: user.id,
      userName: user.userName,
      walletAddress: user.walletAddress,
    };

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.jwt.jwtRefreshSecret,
      expiresIn: '1d',
    });

    return refreshToken;
  }

  async createAccessTokenFromRefreshToken(user: PayloadToken) {
    return this.jwtToken(user);
  }
}
