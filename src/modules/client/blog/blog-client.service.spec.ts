import { Test, TestingModule } from '@nestjs/testing';
import { BlogClientService } from './blog-client.service';

describe('BlogClientService', () => {
  let service: BlogClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BlogClientService],
    }).compile();

    service = module.get<BlogClientService>(BlogClientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
