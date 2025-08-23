import { Test, TestingModule } from '@nestjs/testing';
import { CommisionTypeController } from './commision-type.controller';
import { CommisionTypeService } from './commision-type.service';

describe('CommisionTypeController', () => {
  let controller: CommisionTypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommisionTypeController],
      providers: [CommisionTypeService],
    }).compile();

    controller = module.get<CommisionTypeController>(CommisionTypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
