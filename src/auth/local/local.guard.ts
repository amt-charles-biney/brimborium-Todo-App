import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard for local authentication using Passport.
 */
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  /**
   * Determines if local authentication is possible and logs the user in.
   *
   * @param {ExecutionContext} context - The execution context.
   * @returns {Promise<boolean>} A promise that resolves to true if local authentication is successful.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const result = (await super.canActivate(context)) as boolean;
    const request = context.switchToHttp().getRequest();
    await super.logIn(request);
    return result;
  }
}
