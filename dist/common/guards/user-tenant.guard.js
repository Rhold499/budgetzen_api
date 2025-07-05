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
exports.UserTenantGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const prisma_service_1 = require("../../prisma/prisma.service");
let UserTenantGuard = class UserTenantGuard {
    prisma;
    reflector;
    constructor(prisma, reflector) {
        this.prisma = prisma;
        this.reflector = reflector;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const tenant = request.tenant;
        if (!user || !tenant) {
            throw new common_1.ForbiddenException('User or tenant context missing');
        }
        const link = await this.prisma.userTenant.findUnique({
            where: { userId_tenantId: { userId: user.id, tenantId: tenant.id } },
        });
        if (!link || link.status !== 'active') {
            throw new common_1.ForbiddenException('User is not active in this tenant');
        }
        request.userTenant = link;
        return true;
    }
};
exports.UserTenantGuard = UserTenantGuard;
exports.UserTenantGuard = UserTenantGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        core_1.Reflector])
], UserTenantGuard);
//# sourceMappingURL=user-tenant.guard.js.map