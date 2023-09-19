import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { QueryParserService } from './utilities/query-parser.service';

@Module({
  imports: [UserModule],
  providers: [QueryParserService],
})
export class AppModule {}
