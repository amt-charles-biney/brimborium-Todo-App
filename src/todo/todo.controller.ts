import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { Task } from '@prisma/client';
import { Request as ExpressRequest } from 'express';
import { AuthenticatedGuard } from '../auth/auth.guard';
import { CreateTaskDTO } from './dtos';
import { TodoService } from './todo.service';

@Controller('todo')
export class TodoController {
  constructor(private todoService: TodoService) {}

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
}
