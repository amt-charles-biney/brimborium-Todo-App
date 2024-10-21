import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaService } from '../prisma.service';
import { UserController } from './user.controller';
import { QueryParserService } from '../utilities/query-parser.service';

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService, QueryParserService],
  exports: [UserService],
})
export class UserModule {}
