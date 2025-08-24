import { Test, TestingModule } from '@nestjs/testing';
import { OrientationController } from './orientation.controller';
import { OrientationService } from './orientation.service';

describe('OrientationController', () => {
  let controller: OrientationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrientationController],
      providers: [OrientationService],
    }).compile();

    controller = module.get<OrientationController>(OrientationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
