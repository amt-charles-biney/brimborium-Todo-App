import { BullModule } from '@nestjs/bull';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Queue } from 'bull';
import { PrismaService } from '../prisma.service';
import { CreateTaskDTO, UpdateTaskDTO } from './dtos';
import { TodoService } from './todo.service';

describe('TodoService', () => {
  let todoService: TodoService;
  let prismaService: PrismaService;
  let taskStatusQueue: Queue;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        BullModule.registerQueueAsync({
          name: 'task-status',
        }),
      ],
      providers: [
        TodoService,
        PrismaService,
        { provide: 'task-status', useValue: {} },
      ],
    })
      .useMocker((token) => {
        if (token === PrismaService) {
          const createTaskDto: CreateTaskDTO = {
            topic: 'New Task',
            description: 'Description for New Task',
            dueDate: new Date(),
          };
          return {
            create: jest.fn().mockResolvedValue({
              id: 'newTaskId',
              ...createTaskDto,
            }),
          };
        }
      })
      .compile();

    todoService = module.get<TodoService>(TodoService);
    prismaService = module.get<PrismaService>(PrismaService);
    taskStatusQueue = module.get<Queue>('task-status');
  });

  it('should retrieve a task successfully', async () => {
    const taskId = '1';
    const taskData = {
      id: taskId,
      topic: 'Task 1',
      description: 'Description 1',
      dueDate: new Date(),
    };

    prismaService.task.findUnique = jest.fn().mockResolvedValue(taskData);

    const result = await todoService.getTask(taskId);

    expect(result).toEqual(taskData);
  });

  it('should handle errors during task retrieval', async () => {
    prismaService.task.findUnique = jest
      .fn()
      .mockRejectedValue(new Error('Task retrieval error'));

    try {
      await todoService.getTask('1');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect(error.message).toEqual('Failed to retrieve the task');
      expect(error.getStatus()).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
    }
  });

  it('should create a task successfully', async () => {
    const createTaskDto: CreateTaskDTO = {
      topic: 'New Task',
      description: 'Description for New Task',
      dueDate: new Date(),
    };
    const userId = '1';
    const newTaskId = 'new-task-id';

    prismaService.task.create = jest.fn().mockResolvedValue({
      id: newTaskId,
      ...createTaskDto,
    });

    taskStatusQueue.add = jest.fn().mockResolvedValue({ id: newTaskId });

    const result = await todoService.createTask(createTaskDto, userId);

    expect(result).toEqual({
      id: newTaskId,
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
      .mockRejectedValue(new Error('Task creation error'));

    try {
      await todoService.createTask(createTaskDto, userId);
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect(error.message).toEqual('Task creation error');
      expect(error.getStatus()).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
    }
  });

  it('should retrieve a list of tasks successfully', async () => {
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

  it('should handle errors during task list retrieval', async () => {
    prismaService.task.findMany = jest
      .fn()
      .mockRejectedValue(new Error('Task list retrieval error'));

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

  it('should update a task successfully', async () => {
    const taskId = '1';
    const updateTaskDto: UpdateTaskDTO = {
      topic: 'Updated Task',
      description: 'Updated Description',
      dueDate: new Date(),
    };
    const updatedTaskData = {
      id: taskId,
      ...updateTaskDto,
    };

    prismaService.task.update = jest.fn().mockResolvedValue(updatedTaskData);

    const result = await todoService.updateTask(taskId, updateTaskDto);

    expect(result).toEqual(updatedTaskData);
  });

  it('should handle errors during task update', async () => {
    const taskId = '1';
    const updateTaskDto: UpdateTaskDTO = {
      topic: 'Updated Task',
      description: 'Updated Description',
      dueDate: new Date(),
    };

    try {
      await todoService.updateTask(taskId, updateTaskDto);
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect(error.message).toEqual('Failed to update task. Task not found.');
      expect(error.getStatus()).toEqual(HttpStatus.NOT_FOUND);
    }
  });
});
