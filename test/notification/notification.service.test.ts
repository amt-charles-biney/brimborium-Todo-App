import OneSignal from '@onesignal/node-onesignal';
import { Test } from '@nestjs/testing';
import { NotificationService } from '../../src/notification/notification.service';

describe('test NotificationService', () => {
  let notificationService: NotificationService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [],
      controllers: [],
      providers: [NotificationService],
    }).compile();

    notificationService =
      moduleRef.get<NotificationService>(NotificationService);
  });

  test('NotificationService business', async () => {
    // todo mock and test;
  });
});
