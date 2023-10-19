import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma, Task } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { CreateTaskDTO } from './dtos';

@Injectable()
export class TodoService {
  constructor(private prisma: PrismaService) {}

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

  async tasks(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.TaskWhereUniqueInput;
    where?: Prisma.TaskWhereInput;
    orderBy?: Prisma.TaskOrderByWithRelationInput;
  }): Promise<Task[]> {
    try {
      const { skip, take, cursor, where, orderBy } = params;
      const tasks = await this.prisma.task.findMany({
        skip,
        take,
        cursor,
        where,
        orderBy,
      });

      return tasks;
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve tasks',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
