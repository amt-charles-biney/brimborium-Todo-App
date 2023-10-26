import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from './auth/auth.module';
import { TaskStatusModule } from './jobs/task-status.module';
import { TodoModule } from './todo/todo.module';
import { UserModule } from './user/user.module';
import { QueryParserService } from './utilities/query-parser.service';

@Module({
  imports: [
    UserModule,
    AuthModule,
    PassportModule.register({ session: true }),
    TodoModule,
    TaskStatusModule,
  ],
  providers: [QueryParserService],
})
export class AppModule {}
