import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { PrismaModule } from './config/prisma/prisma.module';

@Module({
  imports: [UserModule, PrismaModule],
  providers: [],
})
export class AppModule {}
