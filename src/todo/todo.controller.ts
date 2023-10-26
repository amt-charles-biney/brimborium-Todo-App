import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Prisma, Task } from '@prisma/client';
import { Request as ExpressRequest } from 'express';
import { AuthenticatedGuard } from '../auth/auth.guard';
import type { CreateTaskDTO } from './dtos';
import { TodoService } from './todo.service';
import { QueryParserService } from '../utilities/query-parser.service';

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
}
