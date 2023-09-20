import { Test, TestingModule } from '@nestjs/testing';
import { TodoService } from './todo.service';
import { PrismaService } from '../prisma.service';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('TodoService', () => {
  let todoService: TodoService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TodoService, PrismaService],
    }).compile();

    todoService = module.get<TodoService>(TodoService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should retrieve tasks successfully with pagination and filtering', async () => {
    const tasksData = [
      {
        id: '1',
        topic: 'Task 1',
        description: 'Description 1',
        dueDate: new Date(),
      },
      {
        id: '2',
        topic: 'Task 2',
        description: 'Description 2',
        dueDate: new Date(),
      },
    ];

    prismaService.task.findMany = jest.fn().mockResolvedValue(tasksData);

    const params = {
      skip: 0,
      take: 10,
      where: { topic: 'Task 1' },
    };

    const result = await todoService.tasks(params);

    expect(result).toEqual(tasksData);
  });

  it('should handle errors during task retrieval', async () => {
    prismaService.task.findMany = jest
      .fn()
      .mockRejectedValue(new Error('Task retrieval error'));

    const params = {
      skip: 0,
      take: 10,
    };

    try {
      await todoService.tasks(params);
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect(error.message).toEqual('Failed to retrieve tasks');
      expect(error.getStatus()).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
    }
  });
});
