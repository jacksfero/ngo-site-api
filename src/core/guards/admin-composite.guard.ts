// core/guards/admin-composite.guard.ts

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Inject,
  forwardRef,
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
      if (!jwtOk) return false;

      const rolesOk = await this.rolesGuard.canActivate(context);
      if (!rolesOk) return false;

      const permissionsOk = await this.permissionsGuard.canActivate(context);
      return permissionsOk;
    }

    // Allow everything else (client routes)
    return true;
  }
}
