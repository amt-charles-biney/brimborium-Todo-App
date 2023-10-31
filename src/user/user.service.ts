import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';
import type { CreateUserDto, UpdateUserDto, UserResultDto } from './dtos';

/**
 * Service responsible for user-related operations.
 * @class
 */
@Injectable()
export class UserService {
  /**
   * Creates a new instance of the UserService.
   * @constructor
   * @param {PrismaService} prisma - An instance of the PrismaService for database access.
   */
  constructor(private prisma: PrismaService) {}

  /**
   * Encrypts a string using bcrypt.
   *
   * @param {string} key - The string to encrypt.
   * @returns {Promise<string>} - A promise that resolves with the hashed string.
   */
  private async encrypt(key: string): Promise<string> {
    const saltOrRounds = 10;
    const password = key;
    const hash = await bcrypt.hash(password, saltOrRounds);

    return hash;
  }

  /**
   * Finds a user by their ID or throws an exception if not found.
   *
   * @param {string} id - The user's ID.
   * @returns {Promise<User>} - A promise that resolves with the user object.
   * @throws {HttpException} - Throws an exception if the user is not found.
   */
  async findUserByIdOrFail(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    return user;
  }

  /**
   * Finds a user by their email.
   *
   * @param {string} email - The user's email.
   * @returns {Promise<User>} - A promise that resolves with the user object, or null if not found.
   */
  async findUserByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    return user;
  }

  /**
   * Creates a new user.
   *
   * @param {CreateUserDto} user - The user data to create.
   * @returns {Promise<string>} - A promise that resolves with the new user's ID.
   * @throws {HttpException} - Throws an exception for duplicate email or server error.
   */
  async createUser(user: CreateUserDto): Promise<string> {
    try {
      const newUser = await this.prisma.user.create({
        data: {
          name: user.name,
          email: user.email,
          password: await this.encrypt(user.password),
        },
      });

      return newUser.id;
    } catch (error) {
      if (error.code === 'P2002' || error.meta?.target?.includes('email')) {
        throw new HttpException(
          'Email address is already in use',
          HttpStatus.BAD_REQUEST,
        );
      } else {
        throw new HttpException(
          'Internal server error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  /**
   * Finds a list of users based on query parameters.
   *
   * @param {object} params - Query parameters for filtering and sorting.
   * @returns {Promise<UserResultDto[]>} - A promise that resolves with a list of users.
   */
  async findUsers(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<UserResultDto[]> {
    const { skip, take, cursor, where, orderBy } = params;

    const users = await this.prisma.user.findMany({
      skip: skip && +skip,
      take: take && +take,
      cursor,
      where,
      orderBy,
    });

    const result = users.map((user) => {
      delete user.password;
      return user;
    });

    return result;
  }

  /**
   * Updates a user's information.
   *
   * @param {string} id - The ID of the user to update.
   * @param {UpdateUserDto} updatedUserData - The updated user data.
   * @returns {Promise<UserResultDto>} - A promise that resolves with the updated user data.
   * @throws {HttpException} - Throws an exception if the user is not found or the update fails.
   */
  async updateUser(
    id: string,
    updatedUserData: UpdateUserDto,
  ): Promise<UserResultDto> {
    try {
      const existingUser = await this.findUserByIdOrFail(id);

      const updateData = {
        name: updatedUserData.name || existingUser.name,
        email: updatedUserData.email || existingUser.email,
        password: updatedUserData.password
          ? await this.encrypt(updatedUserData.password)
          : existingUser.password,
      };

      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: updateData,
      });

      delete updatedUser.password;
      return updatedUser;
    } catch (error) {
      throw new HttpException('Failed to update user', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Deletes a user by their ID.
   *
   * @param {string} id - The ID of the user to delete.
   * @throws {HttpException} - Throws an exception if the user is not found or the deletion fails.
   */
  async deleteUser(id: string): Promise<void> {
    try {
      await this.findUserByIdOrFail(id);

      await this.prisma.user.delete({
        where: {
          id,
        },
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new HttpException(
            'User deletion failed due to constraints',
            HttpStatus.BAD_REQUEST,
          );
        } else {
          throw new HttpException(
            'Failed to delete user',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      } else {
        throw new HttpException(
          'Failed to delete user',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}
