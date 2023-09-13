import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from 'src/users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';
import { SessionSerializer } from './session.serializer';
import { AuthenticatedGuard } from './authenticated.guard';

@Module({
  imports: [UsersModule, PassportModule],
  providers: [
    AuthService,
    LocalStrategy,
    AuthenticatedGuard,
    SessionSerializer,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
