import { InjectQueue } from '@nestjs/bull';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma, Status, Task } from '@prisma/client';
import { Queue } from 'bull';
import { PrismaService } from '../prisma.service';
import type { CreateTaskDTO, UpdateTaskDTO } from './dtos';
import { NotificationService } from '../notification/notification.service';

/**
 * Service for managing to-do tasks.
 */
@Injectable()
export class TodoService {
  /**
   * Constructor for the TodoService class.
   *
   * @param prisma - The PrismaService instance for database interactions.
   * @param notificationService - The NotificationService instance for sending notifications.
   * @param taskStatusQueue - The Bull Queue instance for managing task status updates.
   */
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
    @InjectQueue('task-status') private readonly taskStatusQueue: Queue,
  ) {}

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
   * Create a new task and sets a new queue for status update.
   *
   * @param task - The task data to be created.
   * @param id - The user ID to associate with the task.
   * @returns {Promise<Task>} A promise that resolves to the created task.
   * @throws {HttpException} Throws an exception if the task couldn't be created.
   */
  async createTask(task: CreateTaskDTO, id: string): Promise<Task> {
    try {
      const newTask = await this.prisma.task.create({
        data: {
          topic: task.topic,
          description: task.description,
          dueDate: task.dueDate,
          user: { connect: { id } },
        },
      });

      const delay = new Date(newTask.dueDate).getTime() - Date.now();
      const warningDelay = delay - 600000;

      await this.taskStatusQueue.add(
        'sendWarning',
        {
          userId: id,
          taskId: newTask.id,
          dueDate: newTask.dueDate,
        },
        { delay: warningDelay },
      );

      await this.taskStatusQueue.add(
        'updateStatus',
        {
          userId: id,
          taskId: newTask.id,
          dueDate: newTask.dueDate,
        },
        { delay },
      );

      await this.notificationService.pushNotification(
        id,
        this.notificationService.buildMessage(
          newTask,
          'A new task has been assigned to you.',
        ),
      );

      return newTask;
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

  /**
   * Get a list of tasks with optional pagination, filtering, and update the status of a specific task.
   *
   * @param params - An object containing optional parameters for filtering and pagination.
   * @param query - An object containing the current task ID.
   * @returns {Promise<Task[]>} A promise that resolves to a list of tasks that match the specified criteria.
   * @throws {HttpException} Throws an exception if the tasks could not be found or processed.
   */
  async tasks_(
    params: {
      skip?: number;
      take?: number;
      cursor?: Prisma.TaskWhereUniqueInput;
      where?: Prisma.TaskWhereInput;
      orderBy?: Prisma.TaskOrderByWithRelationInput;
    },
    query: { currentTaskId: string },
  ): Promise<Task[]> {
    try {
      const { skip, take, cursor, where, orderBy } = params;
      const { currentTaskId } = query;

      return this.prisma.$transaction(async (tsx) => {
        await tsx.task.update({
          where: { id: currentTaskId, status: Status.TO_DO },
          data: { status: Status.IN_PROGRESS },
        });

        return await tsx.task.findMany({
          skip,
          take,
          cursor,
          where,
          orderBy,
        });
      });
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve tasks',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Update a task by its ID.
   *
   * @param {string} id - The ID of the task to update.
   * @param {UpdateTaskDTO} task - The updated task data.
   * @returns {Promise<Task>} The updated task.
   * @throws {HttpException} Throws an HTTP exception with a relevant status code
   * if the task does not exist or if the update fails.
   */
  async updateTask(id: string, task: UpdateTaskDTO): Promise<Task> {
    const { topic, description, dueDate } = task;
    try {
      const updatedTask = await this.prisma.task.update({
        where: { id },
        data: {
          topic: topic && topic,
          description: description && description,
          dueDate: dueDate && dueDate,
        },
      });
      return updatedTask;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new HttpException(
          'Failed to update task. Task not found.',
          HttpStatus.NOT_FOUND,
        );
      }
      throw new HttpException(
        'Failed to update task',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Update a task's status by its ID.
   *
   * @param {string} id - The ID of the task to update.
   * @param {Status} status - The updated task data.
   * @returns {Promise<Task>} The updated task.
   * @throws {HttpException} Throws an HTTP exception with a relevant status code
   * if the task does not exist or if the update fails.
   */
  async updateTaskStatus(id: string, status: Status): Promise<Task> {
    try {
      const updatedTask = await this.prisma.task.update({
        where: { id },
        data: {
          status,
        },
      });

      return updatedTask;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new HttpException(
          'Failed to update task. Task not found.',
          HttpStatus.NOT_FOUND,
        );
      }
      throw new HttpException(
        'Failed to update task',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Deletes a task by its ID.
   *
   * @param {string} id - The ID of the task to delete.
   * @returns {Promise<string>} A promise that resolves to the ID of the deleted task.
   * @throws {HttpException} Throws an HTTP exception with a relevant status code
   * if the task does not exist or if the deletion fails.
   */
  async deleteTask(id: string): Promise<string> {
    try {
      await this.prisma.task.delete({
        where: {
          id,
        },
      });

      return id;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new HttpException(
            'Failed to delete task. Task not found.',
            HttpStatus.NOT_FOUND,
          );
        }
      }

      throw new HttpException(
        'Failed to delete task',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
