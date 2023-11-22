import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserDto } from './dtos/create-user.dto';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaService } from '../config/prisma/prisma.service';

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService, PrismaService],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should create a new user and return its ID', async () => {
    const newUser: CreateUserDto = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    userService.createUser = jest.fn().mockResolvedValue('someUserId');

    const result = await userController.addUser(newUser);

    expect(result).toEqual({
      status: true,
      data: { id: 'someUserId' },
    });
  });

  it('should handle errors when user creation fails', async () => {
    const newUser: CreateUserDto = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    userService.createUser = jest
      .fn()
      .mockRejectedValue(
        new HttpException('User creation failed', HttpStatus.BAD_REQUEST),
      );

    try {
      await userController.addUser(newUser);
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect(error.message).toEqual('User creation failed');
      expect(error.getStatus()).toEqual(HttpStatus.BAD_REQUEST);
    }
  });
});
