import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UserService } from '../user/user.service';
import { CreateTaskDTO } from './dtos';
import { Task } from '@prisma/client';

@Injectable()
export class TodoService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
  ) {}

  async getTask(taskId: string): Promise<Task> {
    return await this.prisma.task.findUnique({
      where: { id: taskId },
    });
  }

  async createTask(task: CreateTaskDTO, id: string) {
    try {
      return await this.prisma.task.create({
        data: {
          topic: task.topic,
          description: task.description,
          dueDate: task.dueDate,
          user: { connect: { id } },
        },
      });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
