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
exports.PlanFeatureGuard = exports.RequireFeature = exports.REQUIRED_FEATURE_KEY = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const plans_service_1 = require("../../plans/plans.service");
exports.REQUIRED_FEATURE_KEY = 'requiredFeature';
const RequireFeature = (feature) => (target, propertyKey, descriptor) => {
    Reflect.defineMetadata(exports.REQUIRED_FEATURE_KEY, feature, descriptor?.value || target);
};
exports.RequireFeature = RequireFeature;
let PlanFeatureGuard = class PlanFeatureGuard {
    reflector;
    plansService;
    constructor(reflector, plansService) {
        this.reflector = reflector;
        this.plansService = plansService;
    }
    async canActivate(context) {
        const requiredFeature = this.reflector.getAllAndOverride(exports.REQUIRED_FEATURE_KEY, [context.getHandler(), context.getClass()]);
        if (!requiredFeature) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const tenant = request.tenant;
        if (!tenant) {
            throw new common_1.ForbiddenException('Tenant not found');
        }
        const hasFeature = await this.plansService.validatePlanFeature(tenant.id, requiredFeature);
        if (!hasFeature) {
            throw new common_1.ForbiddenException(`Feature '${requiredFeature}' not available in your current plan`);
        }
        return true;
    }
};
exports.PlanFeatureGuard = PlanFeatureGuard;
exports.PlanFeatureGuard = PlanFeatureGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        plans_service_1.PlansService])
], PlanFeatureGuard);
//# sourceMappingURL=plan-feature.guard.js.map