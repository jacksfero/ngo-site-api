import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

//@Injectable()
//export class FeatureGuard implements CanActivate {

//   constructor(
//     private reflector: Reflector,
//     private featureService: FeatureService
//   ) {}

//   async canActivate(context: ExecutionContext) {

//     const feature = this.reflector.get<string>(
//       'feature',
//       context.getHandler(),
//     );

//     if (!feature) return true;

//     const req = context.switchToHttp().getRequest();

//     const site = req.site;

//     return this.featureService.isFeatureEnabled(site.id, feature);
//   }
//}