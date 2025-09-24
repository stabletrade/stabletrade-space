import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { RewardService } from './reward.service';
import { User } from '../auth/decorators/user.decorator';
import { AuthenGuard } from '../auth/guards/authen.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SignClaimRewardDto } from './dto/reward.dto';

@ApiTags('reward')
@Controller('reward')
export class RewardController {
  constructor(private readonly rewardService: RewardService) {}

  @ApiBearerAuth('access-token')
  @Post('sign-claim-reward')
  @UseGuards(AuthenGuard)
  async signClaimReward(@User() user: any, @Body() body: SignClaimRewardDto) {
    return this.rewardService.signClaimReward(user, body);
  }

  @ApiBearerAuth('access-token')
  @Post('sign-claim-staking-reward')
  @UseGuards(AuthenGuard)
  async signClaimStakingReward(@User() user: any) {
    return this.rewardService.signClaimStakingReward(user);
  }
}
