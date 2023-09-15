import { Module } from '@nestjs/common';
import { TodoService } from './todo.service';
import { PrismaService } from 'src/prisma.service';
import { TodoController } from './todo.controller';
import { QueryParserService } from 'src/generic-services/user-query-parser.service';
import { UsersService } from 'src/users/users.service';

@Module({
  controllers: [TodoController],
  providers: [TodoService, PrismaService, QueryParserService, UsersService],
})
export class TodoModule {}
