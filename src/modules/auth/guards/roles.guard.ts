import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { User } from 'src/shared/entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {

/*
const requiredPermissions =
      this.reflector.get<string[]>(PERMISSIONS_KEY, context.getHandler()) || [];


console.log(  '--1----Role  Guard   ',      requiredRoles   );*/

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
 //console.log( context.getHandler(), '--1----Role  Guard   ',      requiredRoles   );
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: User = request.user;
      console.log(  '----2--Role  Guard   ',      request.user   );
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

   // const userRoles = await user.getRoleNames();
   const rawRoles = user.roles || [];
   const userRoles = rawRoles.map((r: any) => (typeof r === 'string' ? r : r.name));

    const hasRole = requiredRoles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      throw new ForbiddenException(
        `Required roles iiiiiiiii---: ${requiredRoles.join(', ')} -- ${userRoles}`,
      );
    }

    return requiredRoles.some((role) => userRoles.includes(role));
  }
}
