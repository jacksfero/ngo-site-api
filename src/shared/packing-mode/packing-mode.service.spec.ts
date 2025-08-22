import { Test, TestingModule } from '@nestjs/testing';
import { PackingModeService } from './packing-mode.service';

describe('PackingModeService', () => {
  let service: PackingModeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PackingModeService],
    }).compile();

    service = module.get<PackingModeService>(PackingModeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
