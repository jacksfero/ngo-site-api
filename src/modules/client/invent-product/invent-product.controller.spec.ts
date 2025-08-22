import { Test, TestingModule } from '@nestjs/testing';
import { InventProductController } from './invent-product.controller';
import { InventProductService } from './invent-product.service';

describe('InventProductController', () => {
  let controller: InventProductController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InventProductController],
      providers: [InventProductService],
    }).compile();

    controller = module.get<InventProductController>(InventProductController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
