import { Test, TestingModule } from '@nestjs/testing';
import { SurfaceController } from './surface.controller';
import { SurfaceService } from './surface.service';

describe('SurfaceController', () => {
  let controller: SurfaceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SurfaceController],
      providers: [SurfaceService],
    }).compile();

    controller = module.get<SurfaceController>(SurfaceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
