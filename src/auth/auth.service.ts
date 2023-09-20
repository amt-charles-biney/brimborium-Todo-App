import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserResultDto } from 'src/user/dtos';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(private userService: UserService) {}

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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;

    return result;
  }
}
