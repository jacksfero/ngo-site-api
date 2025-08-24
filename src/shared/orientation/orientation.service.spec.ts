import { Test, TestingModule } from '@nestjs/testing';
import { OrientationService } from './orientation.service';

describe('OrientationService', () => {
  let service: OrientationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrientationService],
    }).compile();

    service = module.get<OrientationService>(OrientationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
