import {
  Injectable,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PlanType } from '@prisma/client';

export interface PlanLimits {
  maxUsers: number;
  maxAccounts: number;
  maxOrganizations: number;
  features: string[];
}

@Injectable()
export class PlansService {
  constructor(private prisma: PrismaService) {}

  private readonly planLimits: Record<PlanType, PlanLimits> = {
    [PlanType.FREE]: {
      maxUsers: 1,
      maxAccounts: 1,
      maxOrganizations: 1,
      features: ['basic_transactions', 'simple_reports'],
    },
    [PlanType.FAMILY]: {
      maxUsers: 5,
      maxAccounts: 3,
      maxOrganizations: 1,
      features: [
        'basic_transactions',
        'simple_reports',
        'receipt_upload',
        'transaction_history',
        'basic_dashboard',
        'budget_management', // 5 categories max
        'category_management',
      ],
    },
    [PlanType.PRO]: {
      maxUsers: -1, // Unlimited
      maxAccounts: -1, // Unlimited
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
        'budget_management', // Unlimited
        'category_management',
        'project_goals', // Pro feature
        'bank_integration',
        'advanced_analytics',
      ],
    },
    [PlanType.ENTERPRISE]: {
      maxUsers: -1, // Unlimited
      maxAccounts: -1, // Unlimited
      maxOrganizations: -1, // Unlimited
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

  async checkPlanLimits(
    tenantId: string,
    resource: 'users' | 'accounts' | 'organizations',
  ): Promise<boolean> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { planType: true },
    });

    if (!tenant) {
      throw new ForbiddenException('Tenant not found');
    }

    // DEBUG LOG
    console.log('DEBUG checkPlanLimits:', {
      tenantId,
      planType: tenant.planType,
      resource,
    });
    const limits = this.planLimits[tenant.planType];
    if (!limits) {
      console.error('PlanType inconnu ou non supporté:', tenant.planType);
      throw new BadRequestException(
        'PlanType inconnu ou non supporté: ' + tenant.planType,
      );
    }
    const maxLimit = limits[
      `max${resource.charAt(0).toUpperCase() + resource.slice(1, -1)}s` as keyof PlanLimits
    ] as number;

    if (maxLimit === -1) {
      return true; // Unlimited
    }

    const currentCount = await this.getCurrentResourceCount(tenantId, resource);
    return currentCount < maxLimit;
  }

  async validatePlanFeature(
    tenantId: string,
    feature: string,
  ): Promise<boolean> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { planType: true },
    });

    if (!tenant) {
      throw new ForbiddenException('Tenant not found');
    }

    const limits = this.planLimits[tenant.planType];
    return (
      limits.features.includes(feature) ||
      limits.features.includes('all_pro_features')
    );
  }

  async getPlanLimits(planType: PlanType): Promise<PlanLimits> {
    return this.planLimits[planType];
  }

  async upgradePlan(tenantId: string, newPlan: PlanType, userId: string): Promise<void> {
    // Met à jour le plan du tenant
    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { planType: newPlan },
    });

    // Récupère l'utilisateur
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    // Si l'utilisateur était USER, il devient ADMIN après upgrade
    if (user.role === 'USER') {
      await this.prisma.user.update({
        where: { id: userId },
        data: { role: 'ADMIN' },
      });
      // Met à jour aussi le rôle dans user_tenant si présent
      await this.prisma.userTenant.updateMany({
        where: { userId, tenantId },
        data: { role: 'admin' }, // 'admin' et 'member' sont les seuls rôles valides ici
      });
    }
  }

  async getAllPlans() {
    // Récupère tous les plans
    const plans = await this.prisma.plan.findMany({ orderBy: { createdAt: 'desc' } });
    // Compte le nombre de tenants par type de plan
    const tenantsByPlan = await this.prisma.tenant.groupBy({
      by: ['planType'],
      _count: { planType: true },
    });
    // Map pour accès rapide
    const tenantsCountMap = Object.fromEntries(
      tenantsByPlan.map(t => [t.planType, t._count.planType])
    );
    // Retourne chaque plan avec fallback numérique et le nombre de tenants associés
    return plans.map(plan => {
      // Nettoyage robuste de toutes les clés de limits
      const cleanedLimits: Record<string, number> = {};
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

  private async getCurrentResourceCount(
    tenantId: string,
    resource: 'users' | 'accounts' | 'organizations',
  ): Promise<number> {
    switch (resource) {
      case 'users':
        return this.prisma.user.count({ where: { tenantId } });
      case 'accounts':
        return this.prisma.account.count({ where: { tenantId } });
      case 'organizations':
        // For multi-organization support, we'd need to modify the schema
        return 1; // Currently one organization per tenant
      default:
        return 0;
    }
  }
}
