import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma, Task } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import type { CreateTaskDTO } from './dtos';

/**
 * Service for managing to-do tasks.
 */
@Injectable()
export class TodoService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get a task by its ID.
   *
   * @param taskId - The ID of the task to retrieve.
   * @returns {Promise<Task>} A promise that resolves to the retrieved task, or null if not found.
   * @throws {HttpException} Throws an exception if the task could not be found.
   */
  async getTask(taskId: string): Promise<Task | null> {
    try {
      const task = await this.prisma.task.findUnique({
        where: { id: taskId },
      });

      if (task === null) {
        throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
      }

      return task;
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve the task',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Create a new task.
   *
   * @param task - The task data to be created.
   * @param id - The user ID to associate with the task.
   * @returns {Promise<Task>} A promise that resolves to the created task.
   * @throws {HttpException} Throws an exception if the task couldn't be created.
   */
  async createTask(task: CreateTaskDTO, id: string): Promise<Task> {
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

  /**
   * Get a list of tasks with optional pagination and filtering.
   *
   * @param params - An object containing optional parameters for filtering and pagination.
   * @returns {Promise<Task[]>} A promise that resolves to a list of tasks that match the specified criteria.
   * @throws {HttpException} Throws an exception if the tasks could not be found or processed.
   */
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
