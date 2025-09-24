import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountEntity } from 'src/entities/account.entity';
import {
  generateReferralCode,
  transformString,
} from 'src/utils/commonFuntion/randomString';
import {
  ErrorCodeEnum,
  ErrorMessageEnum,
} from 'src/utils/enum/ErrorMessageEnum';
import { getRepository, Repository } from 'typeorm';
import {
  getUserOrdersDto,
  GetUserRewardDto,
  getUserTransactionsDto,
  UpdateUserProfileDto,
} from '../dto/create-user.dto';
import { MinioClientService } from 'src/minio-client/minio-client.service';
import Paging from 'src/utils/commonFuntion/paging';
import { OrdersEntity } from 'src/entities/orders.entity';
import { OrdersActivityEntity } from 'src/entities/order_activity.entity';
import { TokenEntity } from 'src/entities/token.entity';
import { plainToClass } from 'class-transformer';
import {
  GetOrderResponse,
  GetUserOrderActivityResponse,
} from '../dto/get-order.response';
import { PoolEntity } from 'src/entities/pool.entity';
import { UserVolumeEntity } from 'src/entities/user_volume.entity';
import { NetworkTypeEnum } from 'src/utils/enum';
import { RewardEntity } from 'src/entities/reward.entity';
import BigNumber from 'bignumber.js';
import {
  REWARD_STATUS,
  REWARD_TYPE,
  STAKE_STATUS,
  STAKE_TYPE,
} from 'src/utils/enum/commonEnum';
import { StakeEntity } from 'src/entities/stake.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(AccountEntity)
    private userRepository: Repository<AccountEntity>,
    @InjectRepository(OrdersActivityEntity)
    private orderActivityRepository: Repository<OrdersActivityEntity>,
    @InjectRepository(UserVolumeEntity)
    private userVolumeRepository: Repository<UserVolumeEntity>,
    @InjectRepository(RewardEntity)
    private rewardRepository: Repository<RewardEntity>,
    @InjectRepository(StakeEntity)
    private stakeRepository: Repository<StakeEntity>,
    private minioClientService: MinioClientService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(walletAddress: string, networkType: number) {
    try {
      const normalized = (walletAddress || '').toLowerCase();
      const user = await this.userRepository.findOne({
        walletAddress: normalized,
      });
      if (!user) {
        const createData = this.userRepository.save({
          userName: '',
          walletAddress: normalized,
          avatar: '',
          inviteCode: generateReferralCode(),
          networkType,
        });

        return createData;
      }
      return user;
    } catch (error) {
      console.log('Error Validate User', error);
      throw new HttpException(
        error.errorCode || ErrorCodeEnum.ERR_2,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async updateUserRefcode(walletAddress: string, refCode: string) {
    try {
      const checkRefcode = await this.userRepository.findOne({
        inviteCode: refCode,
      });
      if (!checkRefcode)
        throw new HttpException(
          'Invalid referral code',
          HttpStatus.BAD_REQUEST,
        );
      await this.userRepository
        .createQueryBuilder()
        .update()
        .set({
          referralCode: refCode,
        })
        .where('wallet_address = :walletAddress', { walletAddress })
        .execute();
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async GetUserProfile(walletAddress: string) {
    try {
      const user = await this.userRepository.findOne({
        walletAddress: walletAddress,
      });
      const userVolume = await this.userVolumeRepository.findOne({
        walletAddress,
      });
      if (!user) {
        throw new HttpException(ErrorCodeEnum.ERR_3, HttpStatus.BAD_REQUEST);
      }
      const bonusPoint = await this.calculateBonusPoint(
        user,
        Number(userVolume?.volume) || 0,
      );
      return {
        ...user,
        rewardPoints: user.rewardPoints + bonusPoint,
        volume: userVolume?.volume || 0,
      };
    } catch (error) {
      console.log('Error GetUserProfile', error);
      throw new HttpException(
        error.errorCode || ErrorCodeEnum.ERR_2,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async calculateBonusPoint(user: AccountEntity, volume: number) {
    return 0;
  }

  async updateUserProfile(
    userInfo,
    dataBody: UpdateUserProfileDto,
    files: any,
  ) {
    try {
      if (!userInfo) {
        throw new HttpException(ErrorCodeEnum.ERR_3, HttpStatus.BAD_REQUEST);
      }
      const user = await this.userRepository.findOne({
        walletAddress: userInfo.walletAddress,
      });
      let fileName = '';
      if (files && files.image.length > 0) {
        const directPath = `otc-be/avatar`;
        const fileLogo = files.image[0];

        const fileMime = fileLogo.originalname.slice(
          fileLogo.originalname.lastIndexOf('.'),
          fileLogo.originalname.length,
        );

        if (fileLogo.size > 52428800) {
          throw new HttpException(
            ErrorMessageEnum.ERR_9,
            HttpStatus.BAD_REQUEST,
          );
        }
        fileName =
          transformString(fileLogo.originalname) +
          Date.now().toString() +
          fileMime;

        await this.minioClientService.uploadSingle(
          fileLogo,
          directPath,
          fileName,
        );
      }
      const updatedUser = await this.userRepository.save({
        id: user.id,
        userName: dataBody.userName,
        avatar:
          files && files.image.length > 0
            ? 'https://' +
              process.env.MINIO_ENDPOINT +
              ':' +
              process.env.MINIO_PORT +
              '/' +
              process.env.MINIO_BUCKET +
              `/otc/avatar/` +
              fileName
            : user.avatar,
      });

      return updatedUser;
    } catch (error) {
      throw new HttpException(
        error.errorCode || ErrorCodeEnum.ERR_2,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getUserProfile(walletAddress: string) {
    try {
      const userProfile = await this.userRepository.findOne({
        walletAddress: walletAddress,
      });
      if (!userProfile) {
        throw new HttpException(ErrorCodeEnum.ERR_3, HttpStatus.BAD_REQUEST);
      }
      return userProfile;
    } catch (error) {
      throw new HttpException(error?.response, HttpStatus.BAD_REQUEST);
    }
  }

  async getUserOrders(dataQuery: getUserOrdersDto, userInfo) {
    try {
      const paging = Paging(dataQuery.page || 1, dataQuery.limit || 10);
      const userProfile = await this.userRepository.findOne({
        walletAddress: userInfo.walletAddress,
      });
      if (!userProfile) {
        throw new HttpException(ErrorCodeEnum.ERR_3, HttpStatus.BAD_REQUEST);
      }

      const createQuery = getRepository(OrdersEntity)
        .createQueryBuilder('oe')
        .where(
          'oe.order_creator = :walletAddress AND oe.network_type = :networkType',
          {
            walletAddress: userInfo.walletAddress,
            networkType: dataQuery.networkType || NetworkTypeEnum.APTOS,
          },
        );
      /// addWhere Conditions
      if (dataQuery.filter && dataQuery.filter != '') {
        createQuery.andWhere(`oe.token0_address ILIKE '%:filterString%'`, {
          filterString: dataQuery.filter,
        });
      }
      if (dataQuery.searchBy != null) {
        switch (dataQuery.searchBy) {
          case 0: {
            // BUY
            createQuery.andWhere('oe.order_type = 0');
            break;
          }
          case 1: {
            // SELL
            createQuery.andWhere('oe.order_type = 1');
            break;
          }
          case 2: {
            // Partial
            createQuery.andWhere('oe.match_type = 0');
            break;
          }
          case 3: {
            // Full
            createQuery.andWhere('oe.match_type = 1');
            break;
          }
        }
      }
      createQuery.andWhere('oe.order_status = 1');
      if (
        dataQuery.token0 &&
        dataQuery.token0 != '' &&
        dataQuery.token1 &&
        dataQuery.token1 != ''
      ) {
        createQuery.andWhere(
          'oe.token0_address = :token0Address AND oe.token1_address = :token1Address',
          {
            token0Address: decodeURIComponent(dataQuery.token0),
            token1Address: decodeURIComponent(dataQuery.token1),
          },
        );
      }
      createQuery
        .select(
          `
        oe.id,  
        oe.order_creator,
        oe.token0_address,
        oe.token1_address,
        oe.token0_amount,
        oe.token1_amount,
        CASE 
          WHEN oe.price_type = 1 THEN p.market_price - p.market_price * oe.discount_percent / 100 
            ELSE oe.price 
        END AS price,
        oe.transaction_hash,
        oe.order_type,
        oe.match_type,
        oe.order_id,
        oe.order_status,
        oe.expired_time,
        oe.match_amount,
        oe.remain_amount,
        oe.price_type,
        oe.discount_percent,
        token.token_name as token0_name,
        token.token_symbol as token0_symbol,
        token.logo as token0_logo
      `,
        )
        .leftJoin(
          TokenEntity,
          'token',
          'oe.token0_address = token.contract_address',
        )
        .leftJoin(
          PoolEntity,
          'p',
          'p.token0_address = oe.token0_address and p.token1_address = oe.token1_address',
        );

      const rawData = await createQuery
        .offset(paging.skip)
        .limit(paging.take)
        .getRawMany();

      const totalCount = await createQuery.getCount();

      return {
        rows: plainToClass(GetOrderResponse, rawData, {
          excludeExtraneousValues: true,
        }),
        totalCount: totalCount,
        nextPage: rawData.length < paging.take ? false : true,
      };
    } catch (error) {
      console.log(error);

      throw new HttpException(error?.response, HttpStatus.BAD_REQUEST);
    }
  }

  async getUserTransactions(dataQuery: getUserTransactionsDto, userInfo) {
    try {
      const paging = Paging(dataQuery.page || 1, dataQuery.limit || 10);
      const userProfile = await this.userRepository.findOne({
        walletAddress: userInfo.walletAddress,
      });
      if (!userProfile) {
        throw new HttpException(ErrorCodeEnum.ERR_3, HttpStatus.BAD_REQUEST);
      }

      const createQuery = getRepository(OrdersActivityEntity)
        .createQueryBuilder('oe')
        .where(
          'oe.order_creator = :creatorAddress OR oe.sender = :creatorAddress AND oe.network_type = :networkType',
          {
            creatorAddress: userInfo.walletAddress,
            networkType: dataQuery.networkType || NetworkTypeEnum.APTOS,
          },
        );

      /// addWhere Conditions
      if (
        dataQuery.token0 &&
        dataQuery.token0 != '' &&
        dataQuery.token1 &&
        dataQuery.token1 != ''
      ) {
        createQuery.andWhere(
          'oe.token0_address = :token0Address AND oe.token1_address = :token1Address',
          {
            token0Address: decodeURIComponent(dataQuery.token0),
            token1Address: decodeURIComponent(dataQuery.token1),
          },
        );
      }
      createQuery
        .select(
          `
      oe.id,  
      oe.order_creator,
      oe.token0_address,
      oe.token1_address,
      oe.token0_amount,
      oe.token1_amount,
      oe.price,
      oe.transaction_hash,
      oe.order_type,
      oe.sender,
      oe.order_id,
      oe.timestamp,
      token.token_name as token0_name,
      token.token_symbol as token0_symbol,
      token.logo as token0_logo
    `,
        )
        .leftJoin(
          TokenEntity,
          'token',
          'oe.token0_address = token.contract_address',
        );

      const rawData = await createQuery
        .skip(paging.skip)
        .take(paging.take)
        .getRawMany();

      const totalCount = await createQuery.getCount();

      return {
        rows: plainToClass(GetUserOrderActivityResponse, rawData, {
          excludeExtraneousValues: true,
        }),
        totalCount: totalCount,
        nextPage: rawData.length < paging.take ? false : true,
      };
    } catch (error) {
      throw new HttpException(error?.response, HttpStatus.BAD_REQUEST);
    }
  }

  async getUserReward(dataQuery: GetUserRewardDto, userInfo) {
    try {
      const paging = Paging(dataQuery.page || 1, dataQuery.limit || 10);
      const userProfile = await this.userRepository.findOne({
        walletAddress: userInfo.walletAddress,
      });
      if (!userProfile) {
        throw new HttpException(ErrorCodeEnum.ERR_3, HttpStatus.BAD_REQUEST);
      }

      const query = this.rewardRepository
        .createQueryBuilder('re')
        .where(
          're.wallet_address = :walletAddress AND re.network_type = :networkType',
          {
            walletAddress: userInfo.walletAddress,
            networkType: dataQuery.networkType || NetworkTypeEnum.APTOS,
          },
        )
        .orderBy('re.timestamp', 'DESC')
        .skip(paging.skip)
        .take(paging.take);

      const data = await query.getManyAndCount();
      return {
        rows: data[0],
        totalCount: data[1],
        nextPage: data[0].length < paging.take ? false : true,
      };
    } catch (error) {
      throw new HttpException(error?.response, HttpStatus.BAD_REQUEST);
    }
  }

  async getUserStakeData(userInfo: any) {
    try {
      const userProfile = await this.userRepository.findOne({
        walletAddress: userInfo.walletAddress,
      });
      if (!userProfile) {
        throw new HttpException(ErrorCodeEnum.ERR_3, HttpStatus.BAD_REQUEST);
      }

      const stakeData = await this.stakeRepository.findOne({
        walletAddress: userInfo.walletAddress,
        networkType: NetworkTypeEnum.APTOS,
        type: STAKE_TYPE.STAKE,
      });

      const unstakeData = await this.stakeRepository.find({
        walletAddress: userInfo.walletAddress,
        networkType: NetworkTypeEnum.APTOS,
        type: STAKE_TYPE.UNSTAKE,
      });

      const stakingReward = await this.rewardRepository.findOne({
        walletAddress: userInfo.walletAddress,
        rewardType: REWARD_TYPE.STAKE,
        status: REWARD_STATUS.PENDING,
      });

      return {
        stake: stakeData,
        unstake: unstakeData,
        reward: stakingReward,
      };
    } catch (error) {
      throw new HttpException(error?.response, HttpStatus.BAD_REQUEST);
    }
  }

  async calculateUserVolume() {
    const now = Math.floor(Date.now() / 1000);
    const lastSnapshot = await this.userVolumeRepository.findOne({
      order: { timestamp: 'DESC' },
    });

    const senderVolume = await this.orderActivityRepository
      .createQueryBuilder('oa')
      .select(
        `SUM(oa.volume) as total_volume, oa.sender as wallet_address, oa.network_type as network_type`,
      )
      .where('oa.timestamp > :start AND oa.timestamp <= :end', {
        start: lastSnapshot?.timestamp || 0,
        end: now,
      })
      .groupBy('oa.sender')
      .groupBy('oa.network_type')

      .getRawMany();

    const creatorVolume = await this.orderActivityRepository
      .createQueryBuilder('oa')
      .select(
        `SUM(oa.volume) as total_volume, oa.order_creator as wallet_address`,
      )
      .where('oa.timestamp > :start AND oa.timestamp <= :end', {
        start: lastSnapshot?.timestamp || 0,
        end: now,
      })
      .groupBy('oa.order_creator')
      .getRawMany();

    for (const { total_volume, wallet_address, network_type } of [
      ...senderVolume,
      ...creatorVolume,
    ]) {
      const checkUserVolume = await this.userVolumeRepository.findOne({
        walletAddress: wallet_address,
      });
      if (checkUserVolume) {
        await this.userVolumeRepository
          .createQueryBuilder()
          .update()
          .set({
            volume: () => `volume + ${total_volume}`,
            timestamp: now,
          })
          .execute();
      } else {
        await this.userVolumeRepository.save({
          walletAddress: wallet_address,
          volume: total_volume,
          timestamp: now,
          networkType: network_type,
        });
      }
    }
  }

  async snapshotUserVolumeReward() {
    const totalReward = 30 * 10 ** 6 * 10 ** 18;
    try {
      const allEligibleUsers = await this.userRepository
        .createQueryBuilder('u')
        .where('u.reward_points > 0 AND u.network_type = :networkType', {
          networkType: NetworkTypeEnum.APTOS,
        })
        .getMany();
      const sumPoints = allEligibleUsers.reduce((acc, user) => {
        return acc + user.rewardPoints;
      }, 0);
      for (const user of allEligibleUsers) {
        const reward = Math.floor(
          (user.rewardPoints / sumPoints) * totalReward,
        );
        await this.rewardRepository.save({
          walletAddress: user.walletAddress,
          point: user.rewardPoints,
          timestamp: Math.floor(Date.now() / 1000),
          totalReward: totalReward,
          reward: reward,
          txHash: '',
          rewardType: REWARD_TYPE.VOLUME,
          status: REWARD_STATUS.PENDING,
          networkType: NetworkTypeEnum.APTOS,
        });
        await this.userRepository
          .createQueryBuilder()
          .update()
          .set({
            rewardPoints: 0,
          })
          .where('wallet_address = :walletAddress', {
            walletAddress: user.walletAddress,
          })
          .execute();
      }
    } catch (error) {
      throw new HttpException(error?.response, HttpStatus.BAD_REQUEST);
    }
  }

  async snapshotUserStakingReward() {
    const totalReward = 30 * 10 ** 6 * 10 ** 18;
    try {
      const allEligibleUsers = await this.stakeRepository
        .createQueryBuilder('st')
        .where('st.type = :type AND st.network_type = :networkType', {
          type: STAKE_TYPE.STAKE,
          networkType: NetworkTypeEnum.APTOS,
        })
        .getMany();

      const sumAmountStaked = allEligibleUsers.reduce((acc, user) => {
        return acc + Number(user.amount);
      }, 0);

      for (const user of allEligibleUsers) {
        const reward = Math.floor(
          (user.amount / sumAmountStaked) * totalReward,
        );
        const checkExist = await this.rewardRepository.findOne({
          walletAddress: user.walletAddress,
          rewardType: REWARD_TYPE.STAKE,
          status: REWARD_STATUS.PENDING,
        });
        if (!checkExist) {
          await this.rewardRepository.save({
            walletAddress: user.walletAddress,
            point: user.amount,
            timestamp: Math.floor(Date.now() / 1000),
            totalReward: totalReward,
            reward: reward,
            txHash: '',
            rewardType: REWARD_TYPE.STAKE,
            status: REWARD_STATUS.PENDING,
            networkType: NetworkTypeEnum.APTOS,
          });
        } else {
          await this.rewardRepository
            .createQueryBuilder()
            .update()
            .set({
              reward: () => `reward + ${reward}`,
              totalReward: totalReward,
              timestamp: Math.floor(Date.now() / 1000),
            })
            .where('wallet_address = :walletAddress', {
              walletAddress: user.walletAddress,
            })
            .execute();
        }
      }
    } catch (error) {
      throw new HttpException(error?.response, HttpStatus.BAD_REQUEST);
    }
  }
}
