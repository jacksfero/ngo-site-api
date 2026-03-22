  import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
 import { Observable, tap } from 'rxjs';

 

@Injectable()
export class CPUtiliztionInterceptor implements NestInterceptor{

  intercept(context: ExecutionContext, next: CallHandler<any>)   {
    
   const request = context.switchToHttp().getRequest()
   const url  = request.url;
   const method = request.method;
    console.log(`${method} ${url} started`);

    return next.handle().pipe(
      tap(() => console.log(`${method} ${url} finished`)),
    );
  }




}