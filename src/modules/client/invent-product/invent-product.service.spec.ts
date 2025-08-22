import { Test, TestingModule } from '@nestjs/testing';
import { InventProductService } from './invent-product.service';

describe('InventProductService', () => {
  let service: InventProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InventProductService],
    }).compile();

    service = module.get<InventProductService>(InventProductService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
