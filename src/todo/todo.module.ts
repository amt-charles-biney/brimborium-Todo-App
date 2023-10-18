import { Module } from '@nestjs/common';
import { TodoService } from './todo.service';
import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/user/user.service';
import { TodoController } from './todo.controller';
import { QueryParserService } from 'src/utilities/query-parser.service';

@Module({
  providers: [TodoService, PrismaService, UserService, QueryParserService],
  controllers: [TodoController],
})
export class TodoModule {}
