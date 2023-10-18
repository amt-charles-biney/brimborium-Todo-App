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
import { CreateTaskDTO } from './dtos';
import { TodoService } from './todo.service';
import { QueryParserService } from 'src/utilities/query-parser.service';

@Controller('todo')
export class TodoController {
  constructor(
    private todoService: TodoService,
    private queryParser: QueryParserService,
  ) {}

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
      orderBy: this.queryParser.parseQuery(orderBy),
      where: this.queryParser.parseQuery(where) as Prisma.TaskWhereInput,
    });
  }
}
