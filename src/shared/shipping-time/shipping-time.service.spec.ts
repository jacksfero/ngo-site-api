import { Test, TestingModule } from '@nestjs/testing';
import { ShippingTimeService } from './shipping-time.service';

describe('ShippingTimeService', () => {
  let service: ShippingTimeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShippingTimeService],
    }).compile();

    service = module.get<ShippingTimeService>(ShippingTimeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
