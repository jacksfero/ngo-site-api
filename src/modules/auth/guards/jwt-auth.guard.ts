import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from 'src/core/decorators/public.decorator';
//import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }
  canActivate(context: ExecutionContext) {


      const handler = context.getHandler();
  const className = context.getClass().name;

  
    // 1. Check for @Public() decorator first
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);



//  console.log(`Checking ${context.getHandler().name}, isPublic: ${isPublic}`);

//   console.log(`Checking ${className}.${handler.name}`);
//   console.log(this.reflector.get(IS_PUBLIC_KEY, handler));
//   console.log(this.reflector.get(IS_PUBLIC_KEY, context.getClass()));


    if (isPublic) {
      return true;
    }

    // 2. Proceed with standard JWT validation
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    // 3. Custom error handling
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid or expired token aaaaaaaaaaaaaa');
    }
    return user;
  }
}
 
