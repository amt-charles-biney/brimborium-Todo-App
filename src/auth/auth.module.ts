import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { SessionSerializer } from './local/session.serializer';

@Module({
  imports: [UserModule],
  providers: [AuthService, SessionSerializer],
})
export class AuthModule {}
