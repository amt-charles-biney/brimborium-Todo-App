import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserDto } from './dtos/create-user.dto';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaService } from '../prisma.service';
import { QueryParserService } from '../utilities/query-parser.service';
import { UpdateUserDto } from './dtos';

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService, PrismaService, QueryParserService],
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

  it('should return an array of users with default parameters', async () => {
    userService.findUsers = jest.fn().mockResolvedValue([
      { id: 1, name: 'User 1', email: 'user1@example.com' },
      { id: 2, name: 'User 2', email: 'user2@example.com' },
    ]);

    const result = await userController.findAll();

    expect(result).toHaveLength(2);
  });

  it('should apply orderBy parameter for sorting', async () => {
    userService.findUsers = jest.fn().mockResolvedValue([
      { id: 1, name: 'User B', email: 'userB@example.com' },
      { id: 2, name: 'User A', email: 'userA@example.com' },
    ]);

    const result = await userController.findAll(
      undefined,
      undefined,
      'name:desc',
    );

    expect(result[0].name).toEqual('User B');
  });

  it('should update user data and return the updated user', async () => {
    const userId = '1';
    const updatedUserData: UpdateUserDto = {
      name: 'Updated Name',
      email: 'updated@example.com',
      password: 'newPassword',
    };

    userService.updateUser = jest.fn().mockResolvedValue(updatedUserData);

    const result = await userController.updateUser(userId, updatedUserData);

    expect(result).toEqual({
      status: true,
      data: updatedUserData,
    });
  });

  it('should delete a user successfully', async () => {
    const userId = '1';

    userService.deleteUser = jest.fn();

    const result = await userController.deleteUser(userId);

    expect(result).toEqual({
      status: true,
      message: 'User deleted successfully',
    });

    expect(userService.deleteUser).toHaveBeenCalledWith(userId);
  });

  it('should handle a user not found error', async () => {
    const userId = '1';

    userService.deleteUser = jest
      .fn()
      .mockRejectedValue(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      );

    try {
      await userController.deleteUser(userId);
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect(error.message).toEqual('User not found');
      expect(error.getStatus()).toEqual(HttpStatus.NOT_FOUND);
    }
  });
});
