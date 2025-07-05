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
exports.PlansService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let PlansService = class PlansService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    planLimits = {
        [client_1.PlanType.FREE]: {
            maxUsers: 1,
            maxAccounts: 1,
            maxOrganizations: 1,
            features: ['basic_transactions', 'simple_reports'],
        },
        [client_1.PlanType.FAMILY]: {
            maxUsers: 5,
            maxAccounts: 3,
            maxOrganizations: 1,
            features: [
                'basic_transactions',
                'simple_reports',
                'receipt_upload',
                'transaction_history',
                'basic_dashboard',
                'budget_management',
                'category_management',
            ],
        },
        [client_1.PlanType.PRO]: {
            maxUsers: -1,
            maxAccounts: -1,
            maxOrganizations: 10,
            features: [
                'advanced_transactions',
                'multi_currency',
                'custom_roles',
                'pdf_reports',
                'ai_analysis',
                'automation',
                'advanced_dashboard',
                'api_access',
                'budget_management',
                'category_management',
                'project_goals',
                'bank_integration',
                'advanced_analytics',
            ],
        },
        [client_1.PlanType.ENTERPRISE]: {
            maxUsers: -1,
            maxAccounts: -1,
            maxOrganizations: -1,
            features: [
                'all_pro_features',
                'white_label',
                'custom_integrations',
                'dedicated_support',
                'sla_guarantee',
                'budget_management',
                'category_management',
                'project_goals',
                'bank_integration',
                'advanced_analytics',
            ],
        },
    };
    async checkPlanLimits(tenantId, resource) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
            select: { planType: true },
        });
        if (!tenant) {
            throw new common_1.ForbiddenException('Tenant not found');
        }
        console.log('DEBUG checkPlanLimits:', {
            tenantId,
            planType: tenant.planType,
            resource,
        });
        const limits = this.planLimits[tenant.planType];
        if (!limits) {
            console.error('PlanType inconnu ou non supporté:', tenant.planType);
            throw new common_1.BadRequestException('PlanType inconnu ou non supporté: ' + tenant.planType);
        }
        const maxLimit = limits[`max${resource.charAt(0).toUpperCase() + resource.slice(1, -1)}s`];
        if (maxLimit === -1) {
            return true;
        }
        const currentCount = await this.getCurrentResourceCount(tenantId, resource);
        return currentCount < maxLimit;
    }
    async validatePlanFeature(tenantId, feature) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
            select: { planType: true },
        });
        if (!tenant) {
            throw new common_1.ForbiddenException('Tenant not found');
        }
        const limits = this.planLimits[tenant.planType];
        return (limits.features.includes(feature) ||
            limits.features.includes('all_pro_features'));
    }
    async getPlanLimits(planType) {
        return this.planLimits[planType];
    }
    async upgradePlan(tenantId, newPlan, userId) {
        await this.prisma.tenant.update({
            where: { id: tenantId },
            data: { planType: newPlan },
        });
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            return;
        if (user.role === 'USER') {
            await this.prisma.user.update({
                where: { id: userId },
                data: { role: 'ADMIN' },
            });
            await this.prisma.userTenant.updateMany({
                where: { userId, tenantId },
                data: { role: 'admin' },
            });
        }
    }
    async getAllPlans() {
        const plans = await this.prisma.plan.findMany({ orderBy: { createdAt: 'desc' } });
        const tenantsByPlan = await this.prisma.tenant.groupBy({
            by: ['planType'],
            _count: { planType: true },
        });
        const tenantsCountMap = Object.fromEntries(tenantsByPlan.map(t => [t.planType, t._count.planType]));
        return plans.map(plan => {
            const cleanedLimits = {};
            if (plan.limits && typeof plan.limits === 'object') {
                for (const [key, value] of Object.entries(plan.limits)) {
                    cleanedLimits[key] = Number.isFinite(Number(value)) ? Number(value) : 0;
                }
            }
            return {
                ...plan,
                limits: cleanedLimits,
                tenantsCount: tenantsCountMap[plan.type] || 0,
            };
        });
    }
    async getCurrentResourceCount(tenantId, resource) {
        switch (resource) {
            case 'users':
                return this.prisma.user.count({ where: { tenantId } });
            case 'accounts':
                return this.prisma.account.count({ where: { tenantId } });
            case 'organizations':
                return 1;
            default:
                return 0;
        }
    }
};
exports.PlansService = PlansService;
exports.PlansService = PlansService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PlansService);
//# sourceMappingURL=plans.service.js.map