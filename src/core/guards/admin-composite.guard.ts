// core/guards/admin-composite.guard.ts

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Inject,
  forwardRef,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { PermissionsGuard } from 'src/modules/auth/guards/permissions.guard';

@Injectable()
export class AdminCompositeGuard implements CanActivate {
  constructor(
    private readonly jwtAuthGuard: JwtAuthGuard,
    private readonly rolesGuard: RolesGuard,
    private readonly permissionsGuard: PermissionsGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    // Apply only to /api/admin routes
    if (req.url.startsWith('/api/admin')) {
      const jwtOk = await this.jwtAuthGuard.canActivate(context);
      if (!jwtOk) throw new UnauthorizedException('Invalid or missing token');

      const rolesOk = await this.rolesGuard.canActivate(context);
      if (!rolesOk) throw new ForbiddenException('Insufficient role');

      // Step 2a: Enforce base admin roles for ALL /admin routes
    /*  const user = req.user;
      const roleNames = user.roles?.map((r) => r.name) || [];
      if (!roleNames.includes('Admin') && !roleNames.includes('Super Admin')) {
        throw new ForbiddenException('Admin or Super Admin role required');
      }*/

      const permissionsOk = await this.permissionsGuard.canActivate(context);
      if (!permissionsOk) throw new ForbiddenException('Missing required permission');
      return permissionsOk;
    }

    // Allow everything else (client routes)
    return true;
  }
}
