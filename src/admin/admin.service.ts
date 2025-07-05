import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    try {
      const [
        totalTenants,
        totalUsers,
        totalAccounts,
        totalTransactions,
        activeTenants,
        recentTransactions,
      ] = await Promise.all([
        this.prisma.tenant.count(),
        this.prisma.user.count(),
        this.prisma.account.count(),
        this.prisma.transaction.count(),
        this.prisma.tenant.count({ where: { isActive: true } }),
        this.prisma.transaction.findMany({
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            tenant: { select: { id: true, name: true } },
            createdBy: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        }),
      ]);

      return {
        totals: {
          tenants: totalTenants,
          users: totalUsers,
          accounts: totalAccounts,
          transactions: totalTransactions,
        },
        activeTenants,
        recentTransactions,
      };
    } catch (error) {
      this.logger.error('Error in getDashboardStats', error?.stack ?? error);
      throw error;
    }
  }

  async getSystemHealth() {
    try {
      const [dbStatus, pendingTransactions, failedTransactions, inactiveUsers] =
        await Promise.all([
          this.checkDatabaseConnection(),
          this.prisma.transaction.count({ where: { status: 'PENDING' } }),
          this.prisma.transaction.count({ where: { status: 'FAILED' } }),
          this.prisma.user.count({ where: { isActive: false } }),
        ]);

      return {
        database: dbStatus,
        pendingTransactions,
        failedTransactions,
        inactiveUsers,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error('Error in getSystemHealth', error?.stack ?? error);
      throw error;
    }
  }

  private async checkDatabaseConnection(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      this.logger.error(
        'Error in checkDatabaseConnection',
        error?.stack ?? error,
      );
      return false;
    }
  }

  async getAuditLogs(
    page: number = 1,
    limit: number = 50,
    search?: string,
    action?: string,
    entityType?: string,
    userId?: string,
  ) {
    try {
      const skip = (page - 1) * limit;
      const where: any = {};
      if (action) where.action = { equals: action, mode: 'insensitive' };
      if (entityType)
        where.entityType = { equals: entityType, mode: 'insensitive' };
      if (userId) where.userId = userId;
      if (search) {
        where.OR = [
          { entityId: { contains: search, mode: 'insensitive' } },
          { details: { contains: search, mode: 'insensitive' } },
        ];
      }
      const [logs, total] = await Promise.all([
        this.prisma.auditLog.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.auditLog.count({ where }),
      ]);
      return {
        data: logs,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.logger.error('Error in getAuditLogs', error?.stack ?? error);
      throw error;
    }
  }

  async getTenantAnalytics() {
    try {
      const [tenantsByPlan, tenantsByStatus, tenantGrowth] = await Promise.all([
        this.prisma.tenant.groupBy({
          by: ['planType'],
          _count: { planType: true },
        }),
        this.prisma.tenant.groupBy({
          by: ['isActive'],
          _count: { isActive: true },
        }),
        this.prisma.tenant.findMany({
          select: {
            createdAt: true,
          },
          orderBy: { createdAt: 'asc' },
        }),
      ]);
      const monthlyGrowth = this.calculateMonthlyGrowth(tenantGrowth);
      return {
        byPlan: tenantsByPlan,
        byStatus: tenantsByStatus,
        monthlyGrowth,
      };
    } catch (error) {
      this.logger.error('Error in getTenantAnalytics', error?.stack ?? error);
      throw error;
    }
  }

  private calculateMonthlyGrowth(tenants: { createdAt: Date }[]) {
    const monthlyData = new Map<string, number>();

    tenants.forEach((tenant) => {
      const monthKey = tenant.createdAt.toISOString().slice(0, 7); // YYYY-MM
      monthlyData.set(monthKey, (monthlyData.get(monthKey) || 0) + 1);
    });

    return Array.from(monthlyData.entries())
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  /**
   * KPIs globaux pour le dashboard superadmin
   */
  async getGlobalKpis() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalTenants,
      totalUsers,
      totalAdmins,
      totalTransactions,
      volumeTransactionsValidees,
      tenantsCeMois,
      usersCeMois,
      membresParTenant,
      plans,
    ] = await Promise.all([
      this.prisma.tenant.count(),
      this.prisma.user.count(),
      this.prisma.userTenant.count({ where: { role: 'admin' } }),
      this.prisma.transaction.count(),
      this.prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { status: 'VALIDATED' },
      }),
      this.prisma.tenant.count({ where: { createdAt: { gte: startOfMonth } } }),
      this.prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
      this.prisma.userTenant.groupBy({
        by: ['tenantId'],
        _count: { userId: true },
      }),
      this.prisma.tenant.groupBy({
        by: ['planType'],
        _count: { planType: true },
      }),
    ]);

    // Moyenne membres par tenant
    const moyenneMembres = membresParTenant.length
      ? Math.round(
          membresParTenant.reduce((acc, t) => acc + t._count.userId, 0) /
            membresParTenant.length
        )
      : 0;

    return {
      totalTenants,
      totalUsers,
      totalAdmins,
      totalTransactions,
      volumeTransactionsValidees: volumeTransactionsValidees._sum.amount || 0,
      tenantsCeMois,
      usersCeMois,
      moyenneMembresParTenant: moyenneMembres,
      repartitionPlans: plans,
    };
  }

  async getGlobalAnalytics() {
    // 1. Croissance mensuelle des tenants et users
    const tenants = await this.prisma.tenant.findMany({
      select: { createdAt: true },
    });
    const users = await this.prisma.user.findMany({
      select: { createdAt: true },
    });
    const monthlyGrowthMap = new Map<
      string,
      { tenants: number; users: number }
    >();
    tenants.forEach((t) => {
      const month = t.createdAt.toISOString().slice(0, 7); // YYYY-MM
      if (!monthlyGrowthMap.has(month)) {
        monthlyGrowthMap.set(month, { tenants: 0, users: 0 });
      }
      const entry = monthlyGrowthMap.get(month);
      if (entry) entry.tenants++;
    });
    users.forEach((u) => {
      const month = u.createdAt.toISOString().slice(0, 7);
      if (!monthlyGrowthMap.has(month)) {
        monthlyGrowthMap.set(month, { tenants: 0, users: 0 });
      }
      const entry = monthlyGrowthMap.get(month);
      if (entry) entry.users++;
    });
    const monthlyGrowth = Array.from(monthlyGrowthMap.entries())
      .map(([month, value]) => ({
        month,
        tenants: value.tenants,
        users: value.users,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // 2. Transactions par mois (count et volume)
    const transactions = await this.prisma.transaction.findMany({
      select: { createdAt: true, amount: true },
    });
    const transactionsByMonthMap = new Map<
      string,
      { count: number; volume: number }
    >();
    transactions.forEach((trx) => {
      const month = trx.createdAt.toISOString().slice(0, 7);
      if (!transactionsByMonthMap.has(month)) {
        transactionsByMonthMap.set(month, { count: 0, volume: 0 });
      }
      const entry = transactionsByMonthMap.get(month);
      if (entry) {
        entry.count++;
        entry.volume += Number(trx.amount);
      }
    });
    const transactionsByMonth = Array.from(transactionsByMonthMap.entries())
      .map(([month, value]) => ({
        month,
        count: value.count,
        volume: value.volume,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // 3. Dépenses par catégorie (somme des transactions négatives par catégorie)
    const spendingRaw = await this.prisma.transaction.groupBy({
      by: ['categoryId'],
      _sum: { amount: true },
      where: { type: 'DEBIT', status: 'VALIDATED', categoryId: { not: null } },
    });
    const categories = await this.prisma.category.findMany({
      select: { id: true, name: true },
    });
    const spendingByCategory = spendingRaw.map((s) => {
      const cat = categories.find((c) => c.id === s.categoryId);
      return {
        category: cat?.name || 'Inconnu',
        amount: Math.abs(Number(s._sum.amount) || 0),
      };
    });

    // 4. Objectifs atteints par mois (goals status COMPLETED)
    const goals = await this.prisma.goal.findMany({
      select: { status: true, updatedAt: true },
    });
    const goalsAchievedMap = new Map<string, number>();
    goals.forEach((g) => {
      if (g.status === 'COMPLETED') {
        const month = g.updatedAt.toISOString().slice(0, 7);
        goalsAchievedMap.set(month, (goalsAchievedMap.get(month) || 0) + 1);
      }
    });
    const goalsAchieved = Array.from(goalsAchievedMap.entries())
      .map(([month, achieved]) => ({ month, achieved }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // 5. Top tenants (par nombre d’utilisateurs et transactions)
    const tenantsList = await this.prisma.tenant.findMany({
      select: { id: true, name: true, planType: true },
    });
    const usersByTenant = await this.prisma.user.groupBy({
      by: ['tenantId'],
      _count: { tenantId: true },
    });
    const transactionsByTenant = await this.prisma.transaction.groupBy({
      by: ['tenantId'],
      _count: { tenantId: true },
    });
    const topTenants = tenantsList
      .map((t) => {
        const users =
          usersByTenant.find((u) => u.tenantId === t.id)?._count.tenantId || 0;
        const transactions =
          transactionsByTenant.find((tr) => tr.tenantId === t.id)?._count
            .tenantId || 0;
        return {
          name: t.name,
          users,
          transactions,
          plan: t.planType,
        };
      })
      .sort((a, b) => b.transactions - a.transactions)
      .slice(0, 10);

    return {
      monthlyGrowth,
      transactionsByMonth,
      spendingByCategory,
      goalsAchieved,
      topTenants,
    };
  }

  /**
   * Récupère les paramètres globaux de la plateforme
   */
  async getGlobalSettings() {
    // On suppose qu'il n'y a qu'une seule ligne (id = 'global')
    const settings = await this.prisma.globalSetting.findUnique({ where: { id: 'global' } });
    if (!settings) {
      // Si la ligne n'existe pas, on la crée avec des valeurs par défaut
      return await this.prisma.globalSetting.create({
        data: {
          id: 'global',
          emailTemplates: {},
          securityRules: {},
          features: {},
          systemSettings: {},
        },
      });
    }
    // On ne retourne que les champs attendus par le front
    return {
      emailTemplates: settings.emailTemplates || {},
      securityRules: settings.securityRules || {},
      features: settings.features || {},
    };
  }

  /**
   * Met à jour les paramètres globaux de la plateforme
   */
  async updateGlobalSettings(data: any) {
    // On ne met à jour que les champs autorisés
    const allowedFields = ['emailTemplates', 'securityRules', 'features'];
    const updateData: any = {};
    for (const key of allowedFields) {
      if (data[key] !== undefined) {
        updateData[key] = data[key];
      }
    }
    const updated = await this.prisma.globalSetting.update({
      where: { id: 'global' },
      data: updateData,
    });
    return {
      emailTemplates: updated.emailTemplates || {},
      securityRules: updated.securityRules || {},
      features: updated.features || {},
    };
  }
}
