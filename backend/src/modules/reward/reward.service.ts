import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { CrawlStatusEntity } from 'src/entities/crawler_status.entity';
import { RewardEntity } from 'src/entities/reward.entity';
import { Repository } from 'typeorm';
import { SignClaimRewardDto } from './dto/reward.dto';

@Injectable()
export class RewardService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(RewardEntity)
    private rewardRepository: Repository<RewardEntity>,
    @InjectRepository(CrawlStatusEntity)
    private crawlerStatusRepository: Repository<CrawlStatusEntity>,
  ) {}

  async signClaimReward(user: any, body: SignClaimRewardDto) {
    throw new HttpException(
      'Reward signing not supported on Aptos',
      HttpStatus.BAD_REQUEST,
    );
  }

  async signClaimStakingReward(user: any) {
    throw new HttpException(
      'Reward signing not supported on Aptos',
      HttpStatus.BAD_REQUEST,
    );
  }
}
