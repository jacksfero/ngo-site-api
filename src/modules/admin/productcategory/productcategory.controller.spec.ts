import { Test, TestingModule } from '@nestjs/testing';
import { ProductcategoryController } from './productcategory.controller';
import { ProductcategoryService } from './productcategory.service';

describe('ProductcategoryController', () => {
  let controller: ProductcategoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductcategoryController],
      providers: [ProductcategoryService],
    }).compile();

    controller = module.get<ProductcategoryController>(ProductcategoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
