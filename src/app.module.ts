import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { QueryParserService } from './utilities/query-parser.service';
import { AuthModule } from './auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { TodoModule } from './todo/todo.module';
import { TaskStatusModule } from './jobs/task-status.module';

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
