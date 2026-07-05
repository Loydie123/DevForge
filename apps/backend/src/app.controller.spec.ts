import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventBusService } from './event-bus/event-bus.service';

const mockEventBus = { emit: jest.fn(), on: jest.fn() };

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        { provide: EventBusService, useValue: mockEventBus },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return Hello World string', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});
