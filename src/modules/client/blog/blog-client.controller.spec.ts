import { Test, TestingModule } from '@nestjs/testing';
import { BlogClientController } from './blog-client.controller';

describe('BlogClientController', () => {
  let controller: BlogClientController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlogClientController],
    }).compile();

    controller = module.get<BlogClientController>(BlogClientController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
