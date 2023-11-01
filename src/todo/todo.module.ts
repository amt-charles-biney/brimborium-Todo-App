import { Module } from '@nestjs/common';
import { TodoService } from './todo.service';
import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/user/user.service';
import { TodoController } from './todo.controller';

@Module({
  providers: [TodoService, PrismaService, UserService],
  controllers: [TodoController],
})
export class TodoModule {}
