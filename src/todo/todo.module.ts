import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UserService } from '../user/user.service';
import { QueryParserService } from '../utilities/query-parser.service';
import { TodoController } from './todo.controller';
import { TodoService } from './todo.service';
import { TaskStatusModule } from '../jobs/task-status.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [TaskStatusModule, HttpModule],
  providers: [TodoService, PrismaService, UserService, QueryParserService],
  controllers: [TodoController],
})
export class TodoModule {}
