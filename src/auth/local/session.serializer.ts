/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { User } from '@prisma/client';

/**
 * Passport session serializer for user sessions.
 */
@Injectable()
export class SessionSerializer extends PassportSerializer {
  /**
   * Serialize the user's session data.
   *
   * @param {User} user - The user object to be serialized.
   * @param {(err: Error, user: string) => void} done - The callback function.
   */
  serializeUser(user: User, done: (err: Error, user: string) => void) {
    done(null, user.id);
  }

  /**
   * Deserialize the user's session data.
   *
   * @param {any} payload - The serialized user data.
   * @param {(err: Error, payload: string) => void} done - The callback function.
   */
  deserializeUser(
    payload: any,
    done: (err: Error, payload: string) => void,
  ): any {
    done(null, payload);
  }
}
