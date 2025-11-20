"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePickupDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_pickup_dto_1 = require("./create-pickup.dto");
class UpdatePickupDto extends (0, swagger_1.PartialType)(create_pickup_dto_1.CreatePickupDto) {
}
exports.UpdatePickupDto = UpdatePickupDto;
//# sourceMappingURL=update-pickup.dto.js.map