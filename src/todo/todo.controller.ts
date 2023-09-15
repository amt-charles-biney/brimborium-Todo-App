import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Prisma, Task } from '@prisma/client';
import { Request as ExpressRequest } from 'express';
import { AuthenticatedGuard } from 'src/auth/authenticated.guard';
import { QueryParserService } from 'src/generic-services/user-query-parser.service';
import { TodoService } from './todo.service';

@Controller('todo')
export class TodoController {
  constructor(
    private todoService: TodoService,
    private readonly queryParser: QueryParserService,
  ) {}

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
      orderBy: this.queryParser.parseOrderBy(orderBy),
      where: this.queryParser.parseWhere(where) as Prisma.TaskWhereInput,
    });
  }

  @UseGuards(AuthenticatedGuard)
  @Get(':id')
  getOne(@Param('id') id: string): Promise<Task> {
    return this.todoService.task({ id });
  }

  @UseGuards(AuthenticatedGuard)
  @Post()
  create(@Body() task: Task, @Request() req: ExpressRequest): Promise<Task> {
    const { topic, description, dueDate } = task;
    const newTask = {
      topic,
      description,
      dueDate,
    };

    return this.todoService.createTask(newTask, req.user as string);
  }
}
