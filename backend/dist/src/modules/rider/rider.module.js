"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiderModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const rider_controller_1 = require("./rider.controller");
const rider_service_1 = require("./rider.service");
const shipment_entity_1 = require("../../entities/shipment.entity");
const manifest_entity_1 = require("../../entities/manifest.entity");
const rider_location_entity_1 = require("../../entities/rider-location.entity");
const user_entity_1 = require("../../entities/user.entity");
let RiderModule = class RiderModule {
};
exports.RiderModule = RiderModule;
exports.RiderModule = RiderModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([shipment_entity_1.Shipment, manifest_entity_1.Manifest, rider_location_entity_1.RiderLocation, user_entity_1.User]),
        ],
        controllers: [rider_controller_1.RiderController],
        providers: [rider_service_1.RiderService],
        exports: [rider_service_1.RiderService],
    })
], RiderModule);
//# sourceMappingURL=rider.module.js.map