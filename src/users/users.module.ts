import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { QueryParserService } from 'src/generic-services/user-query-parser.service';
import { UsersController } from './users.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, QueryParserService, PrismaService],
  exports: [UsersService],
})
export class UsersModule {}
