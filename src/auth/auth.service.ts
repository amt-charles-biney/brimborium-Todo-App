/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import type { UserResultDto } from 'src/user/dtos';
import { UserService } from '../user/user.service';
import { PrismaService } from '../prisma.service';

/**
 * Service responsible for authentication and user sign-in.
 */
@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private prismaService: PrismaService,
  ) {}

  /**
   * Update the last login date for a user.
   *
   * @param {string} id - The ID of the user whose last login is to be updated.
   */
  async updateLastLogin(id: string) {
    await this.prismaService.user.update({
      where: { id },
      data: {
        lastLogin: new Date().toISOString(),
      },
    });
  }

  /**
   * Sign in a user with their email and password.
   *
   * @param {string} incomingEmail - The user's email for sign-in.
   * @param {string} incomingPassword - The user's password for sign-in.
   * @returns {Promise<UserResultDto>} A promise that resolves to user data (excluding the password).
   * @throws {UnauthorizedException} If the sign-in is unsuccessful.
   */
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
