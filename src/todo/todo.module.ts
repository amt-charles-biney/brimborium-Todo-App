import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/user/user.service';
import { QueryParserService } from 'src/utilities/query-parser.service';
import { TodoController } from './todo.controller';
import { TodoService } from './todo.service';
import { TaskStatusModule } from '../jobs/task-status.module';

@Module({
  imports: [TaskStatusModule],
  providers: [TodoService, PrismaService, UserService, QueryParserService],
  controllers: [TodoController],
})
export class TodoModule {}
