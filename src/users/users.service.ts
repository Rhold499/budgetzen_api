import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PlansService } from '../plans/plans.service';
import { WebhooksService } from '../webhooks/webhooks.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtService } from '@nestjs/jwt';
import { InviteUserDto } from './dto/invite-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private plansService: PlansService,
    private webhooksService: WebhooksService,
    private jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto, tenantId: string) {
    try {
      // Check plan limits before creating user
      const canAddUser = await this.plansService.checkPlanLimits(
        tenantId,
        'users',
      );
      if (!canAddUser) {
        throw new ForbiddenException(
          'User limit reached for your current plan',
        );
      }

      // Hash du mot de passe si présent
      let hashedPassword = '';
      if (createUserDto.password) {
        hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      }

      const user = await this.prisma.user.create({
        data: {
          email: createUserDto.email,
          firstName: createUserDto.firstName,
          lastName: createUserDto.lastName,
          role: createUserDto.role || 'USER',
          isActive:
            typeof createUserDto.isActive === 'boolean'
              ? createUserDto.isActive
              : true,
          tenantId: createUserDto.tenantId || tenantId,
          password: hashedPassword,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          tenantId: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Trigger webhook
      await this.webhooksService.onUserCreated(user);

      // Log d'audit : création utilisateur
      await this.prisma.auditLog.create({
        data: {
          action: 'USER_CREATED',
          entityType: 'User',
          entityId: user.id,
          newValues: user,
          // userId: createUserDto.createdBy || null, // à adapter selon contexte d'appel
        },
      });

      return user;
    } catch (error) {
      console.error("Erreur lors de la création d'un utilisateur:", error);
      throw error;
    }
  }

  async findAll(
    tenantId: string | undefined,
    page: number = 1,
    limit: number = 10,
    role?: string,
    search?: string,
    isActive?: string,
  ) {
    const skip = (page - 1) * limit;
    // Construction du filtre Prisma sécurisé
    const where: any = {};
    if (tenantId) {
      where.tenantId = tenantId;
    }
    if (role) {
      where.role = role;
    }
    if (typeof isActive === 'string' && ['true', 'false'].includes(isActive)) {
      where.isActive = isActive === 'true';
    }
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }
    // Sécurité : un ADMIN ne peut voir que les users de son tenant, un SUPERADMIN peut tout voir
    // (déjà géré par le passage du tenantId plus haut)
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string, tenantId?: string, role?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        tenantId: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Si le rôle n'est pas SUPERADMIN, vérifier l'appartenance au tenant
    if (role !== 'SUPERADMIN' && tenantId && user.tenantId !== tenantId) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        tenant: true,
      },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto, tenantId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, tenantId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Log d'audit : modification utilisateur
    await this.prisma.auditLog.create({
      data: {
        action: 'USER_UPDATED',
        entityType: 'User',
        entityId: updatedUser.id,
        newValues: updatedUser,
        // userId: updateUserDto.updatedBy || null, // à adapter selon contexte d'appel
      },
    });

    return updatedUser;
  }

  async remove(id: string, tenantId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, tenantId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const deletedUser = await this.prisma.user.delete({
      where: { id },
    });

    // Log d'audit : suppression utilisateur
    await this.prisma.auditLog.create({
      data: {
        action: 'USER_DELETED',
        entityType: 'User',
        entityId: deletedUser.id,
        oldValues: deletedUser,
        userId: null, // à adapter selon contexte d'appel
      },
    });

    return deletedUser;
  }

  async inviteUserToTenant(
    dto: InviteUserDto,
    tenantId: string,
    inviterId: string,
  ) {
    let user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: dto.email,
          isActive: false,
          password: '',
          firstName: dto.firstName || 'Invited',
          lastName: dto.lastName || 'User',
          tenantId: tenantId,
        },
      });
    }
    await this.prisma.userTenant.upsert({
      where: { userId_tenantId: { userId: user.id, tenantId } },
      update: { role: dto.role || 'MEMBER', status: 'pending' },
      create: {
        userId: user.id,
        tenantId,
        role: dto.role || 'MEMBER',
        status: 'pending',
      },
    });
    const payload = {
      email: user.email,
      tenantId,
      role: dto.role || 'MEMBER',
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
    };
    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
    });
    const link = `${process.env.FRONTEND_URL}/accept-invitation?token=${token}`;
    return { link };
  }

  async getUserTenants(userId: string) {
    return this.prisma.userTenant.findMany({
      where: { userId, status: 'active' },
      include: { tenant: true },
    });
  }

  async switchTenant(userId: string, tenantId: string) {
    const link = await this.prisma.userTenant.findUnique({
      where: { userId_tenantId: { userId, tenantId } },
    });
    if (!link || link.status !== 'active')
      throw new ForbiddenException('Not allowed');
    return { message: 'Tenant switched', tenantId };
  }

  async getUserLogs(userId: string, requesterRole?: string, requesterTenantId?: string) {
    // Si ce n'est pas un SUPERADMIN, vérifier que l'utilisateur cible appartient au même tenant
    if (requesterRole !== 'SUPERADMIN') {
      const targetUser = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { tenantId: true },
      });
      if (!targetUser || targetUser.tenantId !== requesterTenantId) {
        throw new ForbiddenException('Access denied');
      }
    }
    // Récupère les logs d'audit liés à cet utilisateur
    return this.prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}
