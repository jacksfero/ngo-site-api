import { Test, TestingModule } from '@nestjs/testing';
import { SurfaceService } from './surface.service';

describe('SurfaceService', () => {
  let service: SurfaceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SurfaceService],
    }).compile();

    service = module.get<SurfaceService>(SurfaceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
