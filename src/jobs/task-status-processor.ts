import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { PrismaService } from '../prisma.service';
import { Status } from '@prisma/client';
import { Scope } from '@nestjs/common';

/**
 * Processor for updating the status of tasks when their due date has passed.
 */
@Processor({ name: 'task-status', scope: Scope.REQUEST })
export class TaskStatusProcessor {
  /**
   * Create an instance of TaskStatusProcessor.
   * @param {PrismaService} prismaService - The Prisma service for database operations.
   */
  constructor(private prismaService: PrismaService) {}

  /**
   * Process the 'updateStatus' job and update the status of a task when its due date has passed.
   * @param {Job} job - The Bull job containing task information.
   */
  @Process('updateStatus')
  async updateStatus(job: Job) {
    /**
     * The ID of the task to update.
     * @type {string}
     */
    const taskId: string = job.data.taskId;

    console.log(job);
    /**
     * The due date of the task.
     * @type {Date}
     */
    const dueDate: Date = job.data.dueDate;

    /**
     * The current date and time.
     * @type {Date}
     */
    const currentDateTime: Date = new Date();

    if (dueDate <= currentDateTime) {
      await this.prismaService.task.update({
        where: { id: taskId, status: Status.IN_PROGRESS },
        data: { status: Status.OVERDUE },
      });
    }
  }
}
