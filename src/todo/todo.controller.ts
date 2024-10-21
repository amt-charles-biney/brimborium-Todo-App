import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Prisma, type Status, type Task } from '@prisma/client';
import { Request as ExpressRequest } from 'express';
import { AuthenticatedGuard } from '../auth/auth.guard';
import { QueryParserService } from '../utilities/query-parser.service';
import type { CreateTaskDTO, UpdateTaskDTO } from './dtos';
import { TodoService } from './todo.service';

/**
 * Controller for managing to-do task operations.
 */
@Controller('todo')
export class TodoController {
  constructor(
    private todoService: TodoService,
    private queryParser: QueryParserService,
  ) {}

  /**
   * Create a new to-do task.
   *
   * @param task - The task data to be created.
   * @param req - The Express request object.
   * @returns {Promise<Task>} A promise that resolves to the created task.
   */
  @UseGuards(AuthenticatedGuard)
  @Post()
  create(
    @Body() task: CreateTaskDTO,
    @Request() req: ExpressRequest,
  ): Promise<Task> {
    const { topic, description, dueDate } = task;
    const newTask = {
      topic,
      description,
      dueDate,
    };

    return this.todoService.createTask(newTask, req.user as string);
  }

  /**
   * Get a list of to-do tasks with optional pagination and filtering.
   *
   * @param skip - The number of items to skip in the result.
   * @param take - The maximum number of items to return.
   * @param orderBy - The order in which to return the results.
   * @param where - The conditions to filter the results.
   * @returns {Promise<Task[]>} A promise that resolves to a list of tasks that match the specified criteria.
   */
  @UseGuards(AuthenticatedGuard)
  @Get()
  getAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('orderBy') orderBy?: string,
    @Query('where') where?: string,
  ): Promise<Task[]> {
    return this.todoService.tasks({
      skip,
      take,
      orderBy: this.queryParser.parseQuery(
        orderBy,
      ) as Prisma.TaskOrderByWithRelationInput,
      where: this.queryParser.parseQuery(where) as Prisma.TaskWhereInput,
    });
  }

  /**
   * Update a to-do task by ID.
   *
   * @param id - The ID of the task to update.
   * @param status - The new status to set for the task.
   * @returns {Promise<Task>} A promise that resolves to the updated task.
   */
  @UseGuards(AuthenticatedGuard)
  @Patch('status/:id')
  updateTaskStatus(
    @Param('id') id: string,
    @Body() data: { status: Status },
  ): Promise<Task> {
    return this.todoService.updateTaskStatus(id, data.status);
  }

  /**
   * Update the status of a to-do task by ID.
   *
   * @param id - The ID of the task to update.
   * @param status - The new status to set for the task.
   * @returns {Promise<Task>} A promise that resolves to the updated task.
   */
  @UseGuards(AuthenticatedGuard)
  @Patch(':id')
  updateTask(
    @Param('id') id: string,
    @Body() data: UpdateTaskDTO,
  ): Promise<Task> {
    return this.todoService.updateTask(id, data);
  }

  /**
   * Delete a to-do task by ID.
   *
   * @param id - The ID of the task to delete.
   * @returns {Promise<void>} A promise that resolves once the task is deleted.
   */
  @UseGuards(AuthenticatedGuard)
  @Delete(':id')
  async deleteTask(
    @Param('id') id: string,
  ): Promise<{ status: boolean; message: string }> {
    await this.todoService.deleteTask(id);
    return {
      status: true,
      message: 'User deleted successfully',
    };
  }
}
