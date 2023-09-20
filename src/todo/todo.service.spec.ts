import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma.service';
import { UserService } from '../user/user.service';
import { CreateTaskDTO } from './dtos';
import { TodoService } from './todo.service';

describe('TodoService', () => {
  let todoService: TodoService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TodoService, PrismaService, UserService],
    }).compile();

    todoService = module.get<TodoService>(TodoService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should get a task successfully', async () => {
    const taskId = '1';
    const taskData = {
      id: taskId,
      topic: 'Task 1',
      description: 'Description for Task 1',
      dueDate: new Date(),
    };

    prismaService.task.findUnique = jest.fn().mockResolvedValue(taskData);

    const result = await todoService.getTask(taskId);

    expect(result).toEqual(taskData);
  });

  it('should create a task successfully', async () => {
    const createTaskDto: CreateTaskDTO = {
      topic: 'New Task',
      description: 'Description for New Task',
      dueDate: new Date(),
    };
    const userId = '1';

    prismaService.task.create = jest.fn().mockResolvedValue({
      id: 'new-task-id',
      ...createTaskDto,
    });

    const result = await todoService.createTask(createTaskDto, userId);

    expect(result).toEqual({
      id: 'new-task-id',
      ...createTaskDto,
    });
  });

  it('should handle errors during task creation', async () => {
    const createTaskDto: CreateTaskDTO = {
      topic: 'New Task',
      description: 'Description for New Task',
      dueDate: new Date(),
    };
    const userId = '1';

    prismaService.task.create = jest
      .fn()
      .mockRejectedValue(new Error('Create task error'));

    try {
      await todoService.createTask(createTaskDto, userId);
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect(error.message).toEqual('Create task error');
      expect(error.getStatus()).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
    }
  });
});
