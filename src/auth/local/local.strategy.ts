import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { UserResultDto } from 'src/user/dtos';

/**
 * Local authentication strategy using Passport.
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  /**
   * Creates an instance of LocalStrategy.
   *
   * @param {AuthService} authService - The authentication service.
   */
  constructor(private authService: AuthService) {
    super({ usernameField: 'email', passwordField: 'password' });
  }

  /**
   * Validate the user's credentials for local authentication.
   *
   * @param {string} email - The user's email.
   * @param {string} password - The user's password.
   * @returns {Promise<UserResultDto>} A promise that resolves to the user's data if authentication is successful.
   */
  async validate(email: string, password: string): Promise<UserResultDto> {
    const user = await this.authService.signIn(email, password);
    return user;
  }
}
