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
 console.log( context.getHandler(), '--1----Role  Guard   ',      requiredRoles   );
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
    const userRoles = user.roles?.map((role) => role.name) || [];

    return requiredRoles.some((role) => userRoles.includes(role));
  }
}
