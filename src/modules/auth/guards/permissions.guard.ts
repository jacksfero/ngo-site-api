// src/auth/permissions.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { User } from 'src/shared/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,

    @Inject(CACHE_MANAGER) private cacheManager: Cache,

    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get required permissions from decorator
    const requiredPermissions =
      this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true; // No permissions required
    }

    const request = context.switchToHttp().getRequest();
    const jwtPayload = request.user; // added by JwtAuthGuard

    if (!jwtPayload) {
      throw new ForbiddenException('User not authenticated');
    }

    const cacheKey = `user_permissions_${jwtPayload.sub}`;
    let userPermissions = await this.cacheManager.get<string[]>(cacheKey);

    if (!userPermissions) {
      // Fetch user from DB with roles + permissions
      const user = await this.userRepo.findOne({
        where: { id: jwtPayload.sub },
        relations: ['roles'], // ✅ must load permissions!
       // relations: ['roles', 'roles.permissions'], // ✅ must load permissions!
      });

      if (!user) {
        throw new ForbiddenException('User not found');
      }

      // Collect all permissions from roles
      userPermissions =
        user.roles?.flatMap((role) =>
          role.permissions?.map((permission) => permission.name) ?? [],
        ) ?? [];

      // Store in cache for 5 min
      await this.cacheManager.set(cacheKey, userPermissions, 300);
    }

    // Check required permissions
    const hasPermission = requiredPermissions.every((permission) =>
      userPermissions!.includes(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Required permissions: ${requiredPermissions.join(', ')}`,
      );
    }

    return true;
  }
}
