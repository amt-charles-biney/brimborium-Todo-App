import { Injectable } from '@nestjs/common';
import { Prisma, Task } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class TodoService {
  constructor(public prisma: PrismaService) {}

  async task(
    taskWhereUniqueInput: Prisma.TaskWhereUniqueInput,
  ): Promise<Task | null> {
    return this.prisma.task.findUnique({
      where: taskWhereUniqueInput,
    });
  }

  async tasks(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.TaskWhereUniqueInput;
    where?: Prisma.TaskWhereInput;
    orderBy?: Prisma.TaskOrderByWithRelationInput;
  }): Promise<Task[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.task.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async getAllTasks(): Promise<Task[]> {
    return await this.prisma.task.findMany();
  }

  async getTask(taskId: string): Promise<Task> {
    return this.prisma.task.findUnique({
      where: { id: taskId },
    });
  }

  async createTask(task: Task) {
    return this.prisma.task.create({
      data: task,
    });
  }

  async updateTask(id: string, task: Task) {
    return this.prisma.task.update({
      where: { id },
      data: task,
    });
  }

  async deleteTask(taskWhereUniqueInput: Prisma.TaskWhereUniqueInput) {
    return this.prisma.task.delete({
      where: taskWhereUniqueInput,
    });
  }
}
