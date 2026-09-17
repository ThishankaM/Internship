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
import { TagsService } from './tags.service.js';
import { CreateTagDto } from './dto/create-tag.dto.js';
import { UpdateTagDto } from './dto/update-tag.dto.js';
import { AuthGuard } from '@nestjs/passport';
import type { AuthenticatedRequest } from '../auth/authenticated-request.js';
import { ApiErrorResponseDto } from '../common/dto/api-error-response.dto.js';

@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth('access-token')
@ApiTags('Tags')
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a tag' })
  create(@Body() createTagDto: CreateTagDto, @Request() req: AuthenticatedRequest) {
    return this.tagsService.create(createTagDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List tags for the authenticated user' })
  findAll(@Request() req: AuthenticatedRequest) {
    return this.tagsService.findAll(req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a tag' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto })
  update(
    @Param('id') id: string,
    @Body() updateTagDto: UpdateTagDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.tagsService.update(id, updateTagDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a tag' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto })
  remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.tagsService.remove(id, req.user.id);
  }
}
