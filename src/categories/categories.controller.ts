import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CurrentTenant } from '../common/decorators/tenant.decorator';
import { CurrentUser } from '../common/decorators/user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CategoryType, UserRole } from '@prisma/client';

@ApiTags('categories')
@ApiBearerAuth()
@Controller('categories')
@UseGuards(RolesGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({ status: 201, description: 'Category successfully created' })
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
    @CurrentTenant() tenant: any,
    @CurrentUser() user: any,
  ) {
    try {
      return await this.categoriesService.create(
        createCategoryDto,
        tenant.id,
        user.id,
      );
    } catch (error) {
      console.error('Erreur dans /categories (POST):', error);
      return {
        statusCode: error.status || 500,
        message: error.message || 'Internal server error',
      };
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({
    status: 200,
    description: 'Categories retrieved successfully',
  })
  async findAll(
    @Query('type') type?: CategoryType,
    @Query('isActive') isActive?: boolean,
    @CurrentTenant() tenant?: any,
    @CurrentUser() user?: any,
  ) {
    try {
      // Pour SUPERADMIN, ignorer tenantId pour tout voir
      if (user?.role === 'SUPERADMIN') {
        return await this.categoriesService.findAll(
          undefined,
          type,
          isActive,
          user.role, // <-- pass userRole
        );
      }
      return await this.categoriesService.findAll(
        tenant.id,
        type,
        isActive,
        user?.role, // <-- pass userRole
      );
    } catch (error) {
      console.error('Erreur dans /categories (GET):', error);
      return {
        statusCode: error.status || 500,
        message: error.message || 'Internal server error',
      };
    }
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get category statistics' })
  @ApiResponse({
    status: 200,
    description: 'Category statistics retrieved successfully',
  })
  getStats(
    @Query('categoryId') categoryId?: string,
    @CurrentTenant() tenant?: any,
  ) {
    return this.categoriesService.getStats(tenant.id, categoryId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiResponse({ status: 200, description: 'Category retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  findOne(@Param('id') id: string, @CurrentTenant() tenant: any) {
    return this.categoriesService.findOne(id, tenant.id);
  }

  @Patch(':id')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Update category' })
  @ApiResponse({ status: 200, description: 'Category updated successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @CurrentTenant() tenant: any,
  ) {
    return this.categoriesService.update(id, updateCategoryDto, tenant.id);
  }

  @Delete(':id')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Delete category' })
  @ApiResponse({ status: 200, description: 'Category deleted successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  remove(@Param('id') id: string, @CurrentTenant() tenant: any) {
    return this.categoriesService.remove(id, tenant.id);
  }
}
