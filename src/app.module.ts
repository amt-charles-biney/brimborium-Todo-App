import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { QueryParserService } from './utilities/query-parser.service';
import { AuthModule } from './auth/auth.module';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [UserModule, AuthModule, PassportModule.register({ session: true })],
  providers: [QueryParserService],
})
export class AppModule {}
