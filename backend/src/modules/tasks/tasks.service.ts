import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountEntity } from 'src/entities/account.entity';
import { TaskEntity } from 'src/entities/tasks.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TaskEntity)
    private taskRepository: Repository<TaskEntity>,
    @InjectRepository(AccountEntity)
    private userRepository: Repository<AccountEntity>,
  ) {}

  async getListTask() {
    try {
      const listTask = await this.taskRepository.find();
      return {
        rows: listTask,
        nextPage: false,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async checkTask(user: any, taskId: number) {
    try {
      const checkTaskExist = await this.taskRepository.findOne({
        id: taskId,
      });
      if (!checkTaskExist)
        throw new HttpException('Task not exist', HttpStatus.BAD_REQUEST);
      const checkUser = await this.userRepository.findOne({
        walletAddress: user.walletAddress,
      });

      const completedTask = JSON.parse(checkUser.completedTasks || '[]') || [];

      if (!completedTask?.includes(taskId)) {
        completedTask.push(taskId);
        await this.userRepository
          .createQueryBuilder()
          .update()
          .set({
            completedTasks: JSON.stringify(completedTask),
            rewardPoints: () => 'reward_points + 100',
          })
          .where('id = :id', { id: checkUser.id })
          .execute();
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
