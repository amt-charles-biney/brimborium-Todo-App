import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

/**
 * Guard to check if a request is authenticated.
 */
@Injectable()
export class AuthenticatedGuard implements CanActivate {
  /**
   * Determines if a request is authenticated.
   *
   * @param {ExecutionContext} context - The execution context.
   * @returns {Promise<boolean>} A promise that resolves to true if the request is authenticated; otherwise, false.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    return request.isAuthenticated();
  }
}
