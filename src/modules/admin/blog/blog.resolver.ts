// import { Resolver, Query, Args, Int } from '@nestjs/graphql';
// //import { Blog } from 'src/shared/entities/blog.entity';
// import { BlogService } from './blog.service';

// @Resolver(() => Blog)
// export class BlogResolver {

//   constructor(private blogService: BlogService) {}

//   @Query(() => [Blog])
//   blogs() {
//     return this.blogService.findAll();
//   }

//   @Query(() => Blog)
//   blog(
//     @Args('id', { type: () => Int }) id: number
//   ) {
//     return this.blogService.findOne(id);
//   }

// }