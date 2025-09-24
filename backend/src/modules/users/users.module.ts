import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountEntity } from 'src/entities/account.entity';
import { MinioClientModule } from 'src/minio-client/minio-client.module';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';
import { TokenEntity } from 'src/entities/token.entity';
import { UserCronService } from './services/cron.service';
import { UserVolumeEntity } from 'src/entities/user_volume.entity';
import { OrdersActivityEntity } from 'src/entities/order_activity.entity';
import { RewardEntity } from 'src/entities/reward.entity';
import { StakeEntity } from 'src/entities/stake.entity';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([
      AccountEntity,
      TokenEntity,
      UserVolumeEntity,
      OrdersActivityEntity,
      RewardEntity,
      StakeEntity,
    ]),
    MinioClientModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, JwtStrategy, UserCronService],
  exports: [UsersService],
})
export class UsersModule {}
