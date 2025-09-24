import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UsersService } from './users.service';

@Injectable()
export class UserCronService {
  constructor(private readonly userService: UsersService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleCron() {
    await this.userService.calculateUserVolume();

    //get creator volume
  }

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async handleCronSnapshotPoint() {
    await this.userService.snapshotUserVolumeReward();
    await this.userService.snapshotUserStakingReward();
  }
}
