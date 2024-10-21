import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { SessionSerializer } from './local/session.serializer';
import { LocalStrategy } from './local/local.strategy';
import { AuthController } from './auth.controller';
import { PrismaService } from '../prisma.service';

@Module({
  imports: [UserModule],
  providers: [AuthService, LocalStrategy, SessionSerializer, PrismaService],
  controllers: [AuthController],
})
export class AuthModule {}
