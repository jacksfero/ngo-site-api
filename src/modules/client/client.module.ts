import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogClientController } from './blog/blog-client.controller';
import { BlogClientService } from './blog/blog-client.service';
import { Blog } from '../../shared/entities/blog.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Blog]), // 👈 This makes BlogRepository available
  ],
  controllers: [BlogClientController],
  providers: [BlogClientService],
})
export class ClientModule {}
