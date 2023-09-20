import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { SessionSerializer } from './local/session.serializer';
import { LocalStrategy } from './local/local.strategy';

@Module({
  imports: [UserModule],
  providers: [AuthService, LocalStrategy, SessionSerializer],
})
export class AuthModule {}
