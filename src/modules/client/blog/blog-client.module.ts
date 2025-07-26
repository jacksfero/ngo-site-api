import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Blog } from 'src/shared/entities/blog.entity';
import { BlogClientController } from './blog-client.controller';
import { BlogClientService } from './blog-client.service';


@Module({

    imports: [
        TypeOrmModule.forFeature([Blog])
    ],
    controllers: [BlogClientController],
    providers: [BlogClientService],
})
export class BlogClientModule { }
