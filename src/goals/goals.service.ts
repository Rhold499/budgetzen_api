import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PlansService } from '../plans/plans.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { CreateContributionDto } from './dto/create-contribution.dto';
import { GoalStatus, Prisma } from '@prisma/client';

@Injectable()
export class GoalsService {
  constructor(
    private prisma: PrismaService,
    private plansService: PlansService,
  ) {}

  async create(
    createGoalDto: CreateGoalDto,
    tenantId: string,
    createdById: string,
  ) {
    // Check if goals feature is available for this plan
    const hasFeature = await this.plansService.validatePlanFeature(
      tenantId,
      'project_goals',
    );
    if (!hasFeature) {
      throw new ForbiddenException(
        'Project goals feature not available in your current plan',
      );
    }

    return this.prisma.goal.create({
      data: {
        ...createGoalDto,
        targetDate: createGoalDto.targetDate
          ? new Date(createGoalDto.targetDate)
          : null,
        tenantId,
        createdById,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            contributions: true,
          },
        },
      },
    });
  }

  async findAll(tenantId: string, status?: GoalStatus, priority?: number) {
    // Vérification du plan pour la feature 'project_goals'
    const hasFeature = await this.plansService.validatePlanFeature(
      tenantId,
      'project_goals',
    );
    if (!hasFeature) {
      throw new ForbiddenException(
        'Project goals feature not available in your current plan'
      );
    }
    const where: Prisma.GoalWhereInput = { tenantId };
    if (status) where.status = status;
    if (priority) where.priority = priority;
    const goals = await this.prisma.goal.findMany({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            contributions: true,
          },
        },
      },
      orderBy: [
        { priority: 'asc' },
        { targetDate: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return goals.map((goal) => {
      const progress =
        goal.targetAmount.toNumber() > 0
          ? (goal.currentAmount.toNumber() / goal.targetAmount.toNumber()) * 100
          : 0;

      const isCompleted =
        goal.currentAmount.toNumber() >= goal.targetAmount.toNumber();
      const remaining = Math.max(
        0,
        goal.targetAmount.toNumber() - goal.currentAmount.toNumber(),
      );

      let daysRemaining = null;
      if (goal.targetDate) {
        const today = new Date();
        const target = new Date(goal.targetDate);
        daysRemaining = Math.ceil(
          (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
        );
      }

      return {
        ...goal,
        progress,
        isCompleted,
        remaining,
        daysRemaining,
      };
    });
  }

  async findOne(id: string, tenantId: string) {
    // Vérification du plan pour la feature 'project_goals'
    const hasFeature = await this.plansService.validatePlanFeature(
      tenantId,
      'project_goals',
    );
    if (!hasFeature) {
      throw new ForbiddenException(
        'Project goals feature not available in your current plan',
      );
    }

    const goal = await this.prisma.goal.findFirst({
      where: { id, tenantId },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        contributions: {
          include: {
            transaction: {
              select: {
                id: true,
                amount: true,
                description: true,
                createdAt: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    const progress =
      goal.targetAmount.toNumber() > 0
        ? (goal.currentAmount.toNumber() / goal.targetAmount.toNumber()) * 100
        : 0;

    const isCompleted =
      goal.currentAmount.toNumber() >= goal.targetAmount.toNumber();
    const remaining = Math.max(
      0,
      goal.targetAmount.toNumber() - goal.currentAmount.toNumber(),
    );

    let daysRemaining = null;
    if (goal.targetDate) {
      const today = new Date();
      const target = new Date(goal.targetDate);
      daysRemaining = Math.ceil(
        (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );
    }

    return {
      ...goal,
      progress,
      isCompleted,
      remaining,
      daysRemaining,
    };
  }

  async update(id: string, updateGoalDto: UpdateGoalDto, tenantId: string) {
    // Vérification du plan pour la feature 'project_goals'
    const hasFeature = await this.plansService.validatePlanFeature(
      tenantId,
      'project_goals',
    );
    if (!hasFeature) {
      throw new ForbiddenException(
        'Project goals feature not available in your current plan',
      );
    }

    const goal = await this.prisma.goal.findFirst({
      where: { id, tenantId },
    });

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    return this.prisma.goal.update({
      where: { id },
      data: {
        ...updateGoalDto,
        targetDate: updateGoalDto.targetDate
          ? new Date(updateGoalDto.targetDate)
          : undefined,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            contributions: true,
          },
        },
      },
    });
  }

  async remove(id: string, tenantId: string) {
    // Vérification du plan pour la feature 'project_goals'
    const hasFeature = await this.plansService.validatePlanFeature(
      tenantId,
      'project_goals',
    );
    if (!hasFeature) {
      throw new ForbiddenException(
        'Project goals feature not available in your current plan',
      );
    }

    const goal = await this.prisma.goal.findFirst({
      where: { id, tenantId },
    });

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    return this.prisma.goal.delete({
      where: { id },
    });
  }

  async addContribution(
    goalId: string,
    createContributionDto: CreateContributionDto,
    tenantId: string,
  ) {
    // Vérification du plan pour la feature 'project_goals'
    const hasFeature = await this.plansService.validatePlanFeature(
      tenantId,
      'project_goals',
    );
    if (!hasFeature) {
      throw new ForbiddenException(
        'Project goals feature not available in your current plan',
      );
    }

    const goal = await this.prisma.goal.findFirst({
      where: { id: goalId, tenantId },
    });

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    if (goal.status !== GoalStatus.ACTIVE) {
      throw new ForbiddenException(
        'Cannot add contributions to inactive goals',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // Create contribution
      const contribution = await tx.goalContribution.create({
        data: {
          ...createContributionDto,
          goalId,
        },
      });

      // Update goal current amount
      const newCurrentAmount =
        parseFloat(goal.currentAmount.toString()) + parseFloat(createContributionDto.amount);
      const updatedGoal = await tx.goal.update({
        where: { id: goalId },
        data: {
          currentAmount: newCurrentAmount.toString(),
          status:
            newCurrentAmount >= parseFloat(goal.targetAmount.toString())
              ? GoalStatus.COMPLETED
              : goal.status,
        },
        include: {
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      return {
        contribution,
        goal: updatedGoal,
        isCompleted: newCurrentAmount >= parseFloat(goal.targetAmount.toString()),
      };
    });
  }

  async getContributions(goalId: string, tenantId: string) {
    const goal = await this.prisma.goal.findFirst({
      where: { id: goalId, tenantId },
    });

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    return this.prisma.goalContribution.findMany({
      where: { goalId },
      include: {
        transaction: {
          select: {
            id: true,
            amount: true,
            description: true,
            createdAt: true,
            createdBy: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getGoalStats(tenantId: string) {
    const [
      totalGoals,
      activeGoals,
      completedGoals,
      totalTargetAmount,
      totalCurrentAmount,
    ] = await Promise.all([
      this.prisma.goal.count({ where: { tenantId } }),
      this.prisma.goal.count({
        where: { tenantId, status: GoalStatus.ACTIVE },
      }),
      this.prisma.goal.count({
        where: { tenantId, status: GoalStatus.COMPLETED },
      }),
      this.prisma.goal.aggregate({
        where: { tenantId },
        _sum: { targetAmount: true },
      }),
      this.prisma.goal.aggregate({
        where: { tenantId },
        _sum: { currentAmount: true },
      }),
    ]);

    const overallProgress =
      totalTargetAmount._sum.targetAmount?.toNumber() > 0
        ? ((totalCurrentAmount._sum.currentAmount?.toNumber() || 0) /
            totalTargetAmount._sum.targetAmount.toNumber()) *
          100
        : 0;

    return {
      totalGoals,
      activeGoals,
      completedGoals,
      totalTargetAmount: totalTargetAmount._sum.targetAmount || 0,
      totalCurrentAmount: totalCurrentAmount._sum.currentAmount || 0,
      overallProgress,
    };
  }

  async linkTransactionToGoal(
    transactionId: string,
    goalId: string,
    tenantId: string,
  ) {
    // Verify transaction and goal belong to tenant
    const [transaction, goal] = await Promise.all([
      this.prisma.transaction.findFirst({
        where: { id: transactionId, tenantId },
      }),
      this.prisma.goal.findFirst({
        where: { id: goalId, tenantId },
      }),
    ]);

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    // Create contribution linked to transaction
    return this.addContribution(
      goalId,
      {
        amount: transaction.amount.toString(),
        description: `Linked from transaction: ${transaction.description || transaction.reference}`,
        transactionId,
      },
      tenantId,
    );
  }
}
