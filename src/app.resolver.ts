// src/app.resolver.ts
import { Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class AppResolver {

  @Query(() => String)
  sayHello(): string {
    return 'Hello World! Jay';
  }

}