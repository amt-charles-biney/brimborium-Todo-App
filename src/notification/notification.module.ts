import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Global()
@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
