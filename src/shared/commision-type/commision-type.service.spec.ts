import { Test, TestingModule } from '@nestjs/testing';
import { CommisionTypeService } from './commision-type.service';

describe('CommisionTypeService', () => {
  let service: CommisionTypeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommisionTypeService],
    }).compile();

    service = module.get<CommisionTypeService>(CommisionTypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
