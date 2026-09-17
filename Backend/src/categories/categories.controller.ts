import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Delete,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CategoriesService } from './categories.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import { AuthGuard } from '@nestjs/passport';
import type { AuthenticatedRequest } from '../auth/authenticated-request.js';
import { ApiErrorResponseDto } from '../common/dto/api-error-response.dto.js';

@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth('access-token')
@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a category' })
  create(
    @Body() createCategoryDto: CreateCategoryDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.categoriesService.create(createCategoryDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List categories for the authenticated user' })
  findAll(@Request() req: AuthenticatedRequest) {
    return this.categoriesService.findAll(req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a category' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto })
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.categoriesService.update(id, updateCategoryDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a category' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto })
  remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.categoriesService.remove(id, req.user.id);
  }
}
