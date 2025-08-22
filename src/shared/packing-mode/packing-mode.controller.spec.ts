import { Test, TestingModule } from '@nestjs/testing';
import { PackingModeController } from './packing-mode.controller';
import { PackingModeService } from './packing-mode.service';

describe('PackingModeController', () => {
  let controller: PackingModeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PackingModeController],
      providers: [PackingModeService],
    }).compile();

    controller = module.get<PackingModeController>(PackingModeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
