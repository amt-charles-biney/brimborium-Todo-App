import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, UserService, PrismaService],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
  });

  it('should sign in a user successfully', async () => {
    const email = 'test@example.com';
    const password = 'password';

    userService.findUserByEmail = jest.fn().mockResolvedValue({
      email,
      password: await bcrypt.hash(password, 10),
    });

    const result = await authService.signIn(email, password);
    authService.updateLastLogin = jest.fn().mockResolvedValue(null);

    expect(result).toEqual({ email });
  });

  it('should throw an UnauthorizedException if the email is not found', async () => {
    const email = 'nonexistent@example.com';
    const password = 'password';

    userService.findUserByEmail = jest.fn().mockResolvedValue(null);

    try {
      await authService.signIn(email, password);
    } catch (error) {
      expect(error).toBeInstanceOf(UnauthorizedException);
    }
  });

  it('should throw an UnauthorizedException if the password is incorrect', async () => {
    const email = 'test@example.com';
    const password = 'incorrectPassword';

    userService.findUserByEmail = jest.fn().mockResolvedValue({
      email,
      password: await bcrypt.hash('correctPassword', 10),
    });

    try {
      await authService.signIn(email, password);
    } catch (error) {
      expect(error).toBeInstanceOf(UnauthorizedException);
    }
  });
});
