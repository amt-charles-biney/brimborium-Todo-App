import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { Task } from '@prisma/client';
import { AxiosError } from 'axios';
import { catchError } from 'rxjs';

/**
 * Service for sending push notifications using the OneSignal API.
 */
@Injectable()
export class NotificationService {
  /**
   * Constructor for the NotificationService class.
   *
   * @param axios - The HttpService instance for making HTTP requests.
   */
  constructor(private axios: HttpService) {}

  /**
   * OneSignal API request options.
   */
  private options = {
    method: 'POST',
    url: 'https://onesignal.com/api/v1/notifications',
    headers: {
      accept: 'application/json',
      Authorization: `Basic ${process.env.OPENSIGNAL_API_KEY}`,
      'content-type': 'application/json',
    },
    data: {
      app_id: process.env.OPENSIGNAL_APP_ID,
      include_aliases: {
        external_id: [''],
      },
      target_channel: 'push',
      contents: { en: '' },
    },
  };

  /**
   * Build a formatted notification message.
   *
   * @param task - The task information.
   * @param prefix - The prefix to add to the message.
   * @returns The formatted notification message.
   */
  buildMessage(task: Partial<Task>, prefix: string): string {
    const formattedDate = String(task.dueDate).slice(0, 21);
    return `${prefix}\nTopic: ${task.topic}\nDue: ${formattedDate}`;
  }

  /**
   * Send a push notification.
   *
   * @param userId - The user ID for whom the notification is intended.
   * @param message - The notification message.
   * @returns A promise that resolves when the notification is sent.
   */
  async pushNotification(userId: string, message: string): Promise<void> {
    this.options.data.include_aliases.external_id[0] = userId;
    this.options.data.contents.en = message;

    // Send the notification request and handle errors.
    this.axios
      .request(this.options)
      .pipe(
        catchError((error: AxiosError) => {
          if (error instanceof AxiosError) {
            throw error.response.data;
          }

          throw new Error(error);
        }),
      )
      .subscribe();
  }
}
