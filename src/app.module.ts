import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { TodoModule } from './todo/todo.module';
import { UsersModule } from './users/users.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './auth/local.strategy';
import { SessionSerializer } from './auth/session.serializer';
import { AuthService } from './auth/auth.service';

@Module({
  imports: [
    UsersModule,
    TodoModule,
    AuthModule,
    PassportModule.register({ session: true }),
  ],
  providers: [AuthService, LocalStrategy, SessionSerializer],
})
export class AppModule {}
