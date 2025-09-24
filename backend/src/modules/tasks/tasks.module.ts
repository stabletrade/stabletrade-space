import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskEntity } from 'src/entities/tasks.entity';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { AccountEntity } from 'src/entities/account.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TaskEntity, AccountEntity])],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [],
})
export class TasksModule {}
