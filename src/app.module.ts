import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { QueryParserService } from './utilities/query-parser.service';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [UserModule, AuthModule],
  providers: [QueryParserService],
})
export class AppModule {}
