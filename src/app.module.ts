// src/app.module.ts
import { Module,forwardRef } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { AdminModule } from './modules/admin/admin.module';
import { ClientModule } from './modules/client/client.module';
import { SharedModule } from './shared/shared.module';
import { UnifiedCacheModule } from './core/cache/cache.module';
import { configurationCache } from './shared/config/configuration.cache';
import payuConfig from './shared/config/payu.config';
import paypalConfig from './shared/config/paypal.config';
import razorpayConfig from './shared/config/razor.config';
import { ScheduleModule } from '@nestjs/schedule';
import { CoreModule } from './core/core.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
//import { PassportModule } from '@nestjs/passport';
import { AppResolver } from './app.resolver';

@Module({
  imports: [
    // 1. Config and Core first
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configurationCache, payuConfig, paypalConfig, razorpayConfig],
    }),
    CoreModule,
    ScheduleModule.forRoot(),
    UnifiedCacheModule.registerAsync(),

    // 2. Then GraphQL
    // GraphQLModule.forRoot<ApolloDriverConfig>({
    //   driver: ApolloDriver,
    //   autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
    //   sortSchema: true,
    //   playground: false, 
    //   plugins: [ApolloServerPluginLandingPageLocalDefault()],
    // }),

    // 3. Then Feature Modules
    AuthModule,  
    AdminModule,
    ClientModule,
    SharedModule,
  ],
  controllers: [AppController],
  providers: [
    AppService, 
    ConfigService,
    AppResolver, // Keep this here!
  ],
})
export class AppModule {}
 