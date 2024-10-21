import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TaskStatusProcessor } from './task-status-processor';
import { PrismaService } from '../prisma.service';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: +process.env.REDIS_PORT,
      },
    }),
    BullModule.registerQueue({
      name: 'task-status',
    }),
  ],
  providers: [TaskStatusProcessor, PrismaService],
  exports: [BullModule],
})
export class TaskStatusModule {}
