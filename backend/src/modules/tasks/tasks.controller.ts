import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { AuthenGuard } from '../auth/guards/authen.guard';
import { User } from '../auth/decorators/user.decorator';

@ApiTags('Task Api')
@Controller('task')
export class TasksController {
  constructor(private readonly taskService: TasksService) {}

  @ApiOperation({ summary: 'Get all' })
  @Get('/get-all')
  getAllTasks() {
    return this.taskService.getListTask();
  }

  @ApiOperation({ summary: 'Check task' })
  @Post('/check-task/:id')
  @UseGuards(AuthenGuard)
  checkTask(@Param('id') taskId: number, @User() user: any) {
    return this.taskService.checkTask(user, taskId);
  }
}
