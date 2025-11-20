"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlaWatcherModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const bull_1 = require("@nestjs/bull");
const schedule_1 = require("@nestjs/schedule");
const sla_watcher_service_1 = require("./sla-watcher.service");
const sla_watcher_processor_1 = require("./sla-watcher.processor");
const sla_watcher_controller_1 = require("./sla-watcher.controller");
const shipment_entity_1 = require("../../entities/shipment.entity");
const notifications_module_1 = require("../notifications/notifications.module");
const audit_module_1 = require("../audit/audit.module");
let SlaWatcherModule = class SlaWatcherModule {
};
exports.SlaWatcherModule = SlaWatcherModule;
exports.SlaWatcherModule = SlaWatcherModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([shipment_entity_1.Shipment]),
            bull_1.BullModule.registerQueue({
                name: 'sla-watcher',
            }),
            schedule_1.ScheduleModule.forRoot(),
            notifications_module_1.NotificationsModule,
            audit_module_1.AuditModule,
        ],
        controllers: [sla_watcher_controller_1.SlaWatcherController],
        providers: [sla_watcher_service_1.SlaWatcherService, sla_watcher_processor_1.SlaWatcherProcessor],
        exports: [sla_watcher_service_1.SlaWatcherService],
    })
], SlaWatcherModule);
//# sourceMappingURL=sla-watcher.module.js.map