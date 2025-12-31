"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const throttler_1 = require("@nestjs/throttler");
const bull_1 = require("@nestjs/bull");
const core_1 = require("@nestjs/core");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const shipments_module_1 = require("./modules/shipments/shipments.module");
const pickup_module_1 = require("./modules/pickup/pickup.module");
const hub_module_1 = require("./modules/hub/hub.module");
const rider_module_1 = require("./modules/rider/rider.module");
const tracking_module_1 = require("./modules/tracking/tracking.module");
const payments_module_1 = require("./modules/payments/payments.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const audit_module_1 = require("./modules/audit/audit.module");
const cache_module_1 = require("./modules/cache/cache.module");
const sla_watcher_module_1 = require("./modules/sla-watcher/sla-watcher.module");
const csrf_module_1 = require("./csrf/csrf.module");
const guards_1 = require("./common/guards");
const filters_1 = require("./common/filters");
const interceptors_1 = require("./common/interceptors");
const csrf_middleware_1 = require("./common/middleware/csrf.middleware");
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(csrf_middleware_1.CsrfMiddleware).forRoutes('*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    type: 'postgres',
                    host: configService.get('DATABASE_HOST'),
                    port: configService.get('DATABASE_PORT'),
                    username: configService.get('DATABASE_USER'),
                    password: configService.get('DATABASE_PASSWORD'),
                    database: configService.get('DATABASE_NAME'),
                    entities: [__dirname + '/**/*.entity{.ts,.js}'],
                    synchronize: configService.get('NODE_ENV') === 'development',
                    logging: configService.get('NODE_ENV') === 'development',
                }),
                inject: [config_1.ConfigService],
            }),
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: 60000,
                    limit: 10,
                },
            ]),
            bull_1.BullModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    redis: {
                        host: configService.get('REDIS_HOST') || 'localhost',
                        port: configService.get('REDIS_PORT') || 6379,
                    },
                }),
                inject: [config_1.ConfigService],
            }),
            cache_module_1.CacheModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            shipments_module_1.ShipmentsModule,
            pickup_module_1.PickupModule,
            hub_module_1.HubModule,
            rider_module_1.RiderModule,
            tracking_module_1.TrackingModule,
            payments_module_1.PaymentsModule,
            notifications_module_1.NotificationsModule,
            audit_module_1.AuditModule,
            sla_watcher_module_1.SlaWatcherModule,
            csrf_module_1.CsrfModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_GUARD,
                useClass: guards_1.JwtAuthGuard,
            },
            {
                provide: core_1.APP_FILTER,
                useClass: filters_1.HttpExceptionFilter,
            },
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: interceptors_1.LoggingInterceptor,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map