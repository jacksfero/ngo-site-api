import { Test, TestingModule } from '@nestjs/testing';
import { MediumController } from './medium.controller';
import { MediumService } from './medium.service';

describe('MediumController', () => {
  let controller: MediumController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MediumController],
      providers: [MediumService],
    }).compile();

    controller = module.get<MediumController>(MediumController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
