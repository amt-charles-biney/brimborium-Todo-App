import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';
import { UserService } from './user.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

describe('UserService', () => {
  let userService: UserService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, PrismaService],
    }).compile();

    userService = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new user', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    const hashedPassword = 'hashedPassword123';

    (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

    prismaService.user.create = jest.fn().mockResolvedValue({
      id: 'someUserId',
      ...userData,
      password: hashedPassword,
    });

    const result = await userService.createUser(userData);

    expect(result).toEqual('someUserId');
  });

  it('should throw a BAD_REQUEST exception when a user with the same email already exists', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    prismaService.user.create = jest.fn().mockRejectedValue({ code: 'P2002' });

    try {
      await userService.createUser(userData);
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect(error.message).toEqual('Email address is already in use');
      expect(error.getStatus()).toEqual(HttpStatus.BAD_REQUEST);
    }
  });

  it('should rethrow other exceptions as is', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    prismaService.user.create = jest
      .fn()
      .mockRejectedValue(new Error('Internal server error'));

    try {
      await userService.createUser(userData);
    } catch (error) {
      expect(error).toEqual(new Error('Internal server error'));
      expect(error.getStatus()).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
    }
  });

  it('should return an array of users with default parameters', async () => {
    prismaService.user.findMany = jest.fn().mockResolvedValue([
      {
        id: '1',
        name: 'User 1',
        email: 'user1@example.com',
        password: 'hashed_password',
      },
      {
        id: '2',
        name: 'User 2',
        email: 'user2@example.com',
        password: 'hashed_password',
      },
    ]);

    const result = await userService.findUsers({});

    expect(result).toHaveLength(2);
  });

  it('should update user data', async () => {
    const userId = '1';
    const updatedUserData = {
      name: 'Updated Name',
      email: 'updated@example.com',
      password: 'newPassword',
    };

    prismaService.user.findUnique = jest.fn().mockResolvedValue({
      id: userId,
      name: 'Original Name',
      email: 'original@example.com',
      password: 'originalHashedPassword',
    });

    userService.findUserByIdOrFail = jest.fn().mockResolvedValue({
      id: userId,
      name: 'Original Name',
      email: 'original@example.com',
      password: 'originalHashedPassword',
    });

    const expectedResult = {
      ...updatedUserData,
      id: userId,
    };

    prismaService.user.update = jest.fn().mockResolvedValue({
      id: userId,
      ...updatedUserData,
    });

    delete expectedResult.password;

    const result = await userService.updateUser(userId, updatedUserData);

    expect(userService.findUserByIdOrFail).toBeCalled();
    expect(result).toEqual(expectedResult);
  });

  it('should throw a BAD_REQUEST exception if user is not found', async () => {
    const userId = '1';

    prismaService.user.findUnique = jest.fn().mockResolvedValue(null);

    try {
      await userService.findUserByIdOrFail(userId);
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect(error.message).toEqual('User not found');
      expect(error.getStatus()).toEqual(HttpStatus.NOT_FOUND);
    }
  });

  it('should delete a user successfully', async () => {
    const userId = '1';

    prismaService.user.delete = jest.fn().mockResolvedValue({ id: userId });

    userService.findUserByIdOrFail = jest.fn().mockResolvedValue({
      id: userId,
      name: 'Original Name',
      email: 'original@example.com',
      password: 'originalHashedPassword',
    });

    await userService.deleteUser(userId);

    expect(prismaService.user.delete).toHaveBeenCalledWith({
      where: { id: userId },
    });
  });

  it('should handle a user not found error', async () => {
    const userId = '1';

    userService.findUserByIdOrFail = jest
      .fn()
      .mockRejectedValue(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      );

    try {
      await userService.deleteUser(userId);
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect(error.message).toEqual('User not found');
      expect(error.getStatus()).toEqual(HttpStatus.NOT_FOUND);
    }
  });

  it('should handle other Prisma request errors', async () => {
    const userId = '1';

    prismaService.user.delete = jest.fn().mockRejectedValue({
      code: 'SomeOtherCode',
    });

    userService.findUserByIdOrFail = jest.fn().mockResolvedValue({
      id: userId,
      name: 'Original Name',
      email: 'original@example.com',
      password: 'originalHashedPassword',
    });

    try {
      await userService.deleteUser(userId);
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect(error.message).toEqual('Failed to delete user');
      expect(error.getStatus()).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
    }
  });

  it('should handle other non-HttpException errors', async () => {
    const userId = '1';

    userService.findUserByIdOrFail = jest
      .fn()
      .mockRejectedValue(new Error('SomeError'));

    try {
      await userService.deleteUser(userId);
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect(error.message).toEqual('Failed to delete user');
      expect(error.getStatus()).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
    }
  });
});
