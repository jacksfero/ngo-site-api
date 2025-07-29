import { Test, TestingModule } from '@nestjs/testing';
import { ProductcategoryService } from './productcategory.service';

describe('ProductcategoryService', () => {
  let service: ProductcategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductcategoryService],
    }).compile();

    service = module.get<ProductcategoryService>(ProductcategoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
