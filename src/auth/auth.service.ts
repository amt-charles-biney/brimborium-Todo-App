/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserResultDto } from 'src/user/dtos';
import { UserService } from '../user/user.service';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private prismaService: PrismaService,
  ) {}

  async updateLastLogin(id: string) {
    await this.prismaService.user.update({
      where: { id },
      data: {
        lastLogin: new Date().toISOString(),
      },
    });
  }

  async signIn(
    incomingEmail: string,
    incomingPassword: string,
  ): Promise<UserResultDto> {
    const user = await this.userService.findUserByEmail(incomingEmail);

    if (!user) {
      throw new UnauthorizedException();
    }

    const isMatch = await bcrypt.compare(incomingPassword, user.password);

    if (!isMatch) {
      throw new UnauthorizedException();
    }

    await this.updateLastLogin(user.id);

    const { password, ...result } = user;

    return result;
  }
}
