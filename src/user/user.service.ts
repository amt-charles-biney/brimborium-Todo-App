import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';
import { CreateUserDto, UpdateUserDto, UserResultDto } from './dtos';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  private async encrypt(key: string): Promise<string> {
    const saltOrRounds = 10;
    const password = key;
    const hash = await bcrypt.hash(password, saltOrRounds);

    return hash;
  }

  async findUserByIdOrFail(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    return user;
  }

  async findUserByEmail(email: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    return user;
  }

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
}
