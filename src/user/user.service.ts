import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';
import { CreateUserDto } from './dtos/create-user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  private async encrypt(key: string): Promise<string> {
    const saltOrRounds = 10;
    const password = key;
    const hash = await bcrypt.hash(password, saltOrRounds);

    return hash;
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
}
