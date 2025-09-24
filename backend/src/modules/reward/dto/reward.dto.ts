import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class SignClaimRewardDto {
  @IsNumber()
  @ApiProperty({ type: Number })
  timestamp: number;
}
