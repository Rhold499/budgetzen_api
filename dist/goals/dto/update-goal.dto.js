"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateContributionDto = exports.UpdateGoalDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_goal_dto_1 = require("./create-goal.dto");
const class_validator_1 = require("class-validator");
const swagger_2 = require("@nestjs/swagger");
class UpdateGoalDto extends (0, swagger_1.PartialType)(create_goal_dto_1.CreateGoalDto) {
}
exports.UpdateGoalDto = UpdateGoalDto;
class UpdateContributionDto {
    amount;
    description;
    transactionId;
}
exports.UpdateContributionDto = UpdateContributionDto;
__decorate([
    (0, swagger_2.ApiPropertyOptional)({ example: '100.00' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDecimal)({ decimal_digits: '0,2' }),
    __metadata("design:type", String)
], UpdateContributionDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_2.ApiPropertyOptional)({ example: 'Contribution mensuelle' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateContributionDto.prototype, "description", void 0);
__decorate([
    (0, swagger_2.ApiPropertyOptional)({ example: 'uuid-transaction-id' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], UpdateContributionDto.prototype, "transactionId", void 0);
//# sourceMappingURL=update-goal.dto.js.map