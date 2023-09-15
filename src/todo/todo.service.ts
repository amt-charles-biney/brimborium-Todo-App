import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma, Task } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { UsersService } from 'src/users/users.service';

export class TaskDTO {
  topic: string;
  description: string;
  dueDate: Date;
}

@Injectable()
export class TodoService {
  constructor(
    public prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  async task(
    taskWhereUniqueInput: Prisma.TaskWhereUniqueInput,
  ): Promise<Task | null> {
    const task = await this.prisma.task.findUnique({
      where: taskWhereUniqueInput,
    });

    if (!task)
      throw new HttpException('Task not found', HttpStatus.BAD_REQUEST);

    return task;
  }

  async tasks(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.TaskWhereUniqueInput;
    where?: Prisma.TaskWhereInput;
    orderBy?: Prisma.TaskOrderByWithRelationInput;
  }): Promise<Task[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return await this.prisma.task.findMany({
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
    return await this.prisma.task.findUnique({
      where: { id: taskId },
    });
  }

  async createTask(task: TaskDTO, id: string) {
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

  async updateTask(id: string, task: Task) {
    return await this.prisma.task.update({
      where: { id },
      data: task,
    });
  }

  async deleteTask(taskWhereUniqueInput: Prisma.TaskWhereUniqueInput) {
    return await this.prisma.task.delete({
      where: taskWhereUniqueInput,
    });
  }
}
