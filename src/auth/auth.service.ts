import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserResult, UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async signIn(
    incomingEmail: string,
    incomingPassword: string,
  ): Promise<UserResult> {
    const user = await this.usersService.findUserByEmail(incomingEmail);

    if (!user) {
      throw new UnauthorizedException();
    }

    const isMatch = await bcrypt.compare(incomingPassword, user.password);

    if (!isMatch) {
      throw new UnauthorizedException();
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;

    return result;
  }
}
