import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma.service';
import { UserService } from '../user/user.service';
import { QueryParserService } from '../utilities/query-parser.service';
import { TodoController } from './todo.controller';
import { TodoService } from './todo.service';
import { TaskStatusModule } from '../jobs/task-status.module';

describe('TodoController', () => {
  let controller: TodoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TaskStatusModule],
      controllers: [TodoController],
      providers: [TodoService, UserService, PrismaService, QueryParserService],
    }).compile();

    controller = module.get<TodoController>(TodoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
