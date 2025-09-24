import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CrawlStatusEntity } from 'src/entities/crawler_status.entity';
import { RewardEntity } from 'src/entities/reward.entity';
import { RewardController } from './reward.controller';
import { RewardService } from './reward.service';

@Module({
  imports: [TypeOrmModule.forFeature([CrawlStatusEntity, RewardEntity])],
  controllers: [RewardController],
  providers: [RewardService],
  exports: [],
})
export class RewardModule {}
