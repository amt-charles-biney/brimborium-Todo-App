import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { PrismaService } from '../prisma.service';
import { Status } from '@prisma/client';
import { Scope } from '@nestjs/common';
import { NotificationService } from '../notification/notification.service';

/**
 * Processor for updating the status of tasks when their due date has passed.
 */
@Processor({ name: 'task-status', scope: Scope.REQUEST })
export class TaskStatusProcessor {
  /**
   * Create an instance of TaskStatusProcessor.
   * @param {PrismaService} prismaService - The Prisma service for database operations.
   */
  constructor(
    private prismaService: PrismaService,
    private notification: NotificationService,
  ) {}

  @Process('sendWarning')
  async sendWarning(
    job: Job<{ userId: string; taskId: string; dueDate: Date }>,
  ) {
    /**
     * The ID of the task to update.
     * @type {string}
     */
    const taskId: string = job.data.taskId;

    try {
      const task = await this.prismaService.task.findUnique({
        where: {
          id: taskId,
          status: {
            in: [Status.TO_DO, Status.IN_PROGRESS],
          },
        },
      });

      await this.notification.pushNotification(
        job.data.userId,
        this.notification.buildMessage(task, 'Task will be due in 10 minutes.'),
      );
    } catch (error) {}
  }

  /**
   * Process the 'updateStatus' job and update the status of a task when its due date has passed.
   * @param {Job} job - The Bull job containing task information.
   */
  @Process('updateStatus')
  async updateStatus(
    job: Job<{ userId: string; taskId: string; dueDate: Date }>,
  ) {
    /**
     * The ID of the task to update.
     * @type {string}
     */
    const taskId: string = job.data.taskId;

    /**
     * The due date of the task.
     * @type {Date}
     */
    const dueDate: Date = new Date(job.data.dueDate);

    /**
     * The current date and time.
     * @type {Date}
     */
    const currentDateTime: Date = new Date();

    if (dueDate <= currentDateTime) {
      try {
        const task = await this.prismaService.task.update({
          where: {
            id: taskId,
            status: {
              in: [Status.TO_DO, Status.IN_PROGRESS],
            },
          },
          data: { status: Status.OVERDUE },
        });

        await this.notification.pushNotification(
          job.data.userId,
          this.notification.buildMessage(task, 'Task overdue'),
        );
      } catch (error) {}
    }
  }
}
