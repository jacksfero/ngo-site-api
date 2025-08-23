import { Test, TestingModule } from '@nestjs/testing';
import { ShippingTimeController } from './shipping-time.controller';
import { ShippingTimeService } from './shipping-time.service';

describe('ShippingTimeController', () => {
  let controller: ShippingTimeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShippingTimeController],
      providers: [ShippingTimeService],
    }).compile();

    controller = module.get<ShippingTimeController>(ShippingTimeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
