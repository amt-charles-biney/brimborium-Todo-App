import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import * as bcrypt from 'bcrypt';

export class UserResult {
  id: string;
  name: string;
  email: string;
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private async findUserByIdOrFail(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return user;
  }

  private async encrypt(key: string): Promise<string> {
    const saltOrRounds = 10;
    const password = key;
    const hash = await bcrypt.hash(password, saltOrRounds);

    return hash;
  }

  async findUsers(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<UserResult[]> {
    const { skip, take, cursor, where, orderBy } = params;

    const users = this.prisma.user.findMany({
      skip: skip && +skip,
      take: take && +take,
      cursor,
      where,
      orderBy,
    });

    const result = (await users).map((user) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    });

    return result;
  }

  async findUserByEmail(email: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    return user;
  }

  async createUser(user: User): Promise<string> {
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
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
      }
    }
  }

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
      } else {
        throw new HttpException(
          'Failed to delete user',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async updateUser(id: string, updatedUserData: User): Promise<UserResult> {
    try {
      const existingUser = await this.findUserByIdOrFail(id);

      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: {
          name: updatedUserData.name || existingUser.name,
          email: updatedUserData.email || existingUser.email,
          password: updatedUserData.password || existingUser.password,
        },
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = updatedUser;

      return result;
    } catch (error) {
      throw new HttpException('Failed to update user', HttpStatus.BAD_REQUEST);
    }
  }
}
