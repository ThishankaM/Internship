import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ProjectsService } from './projects.service.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import type { AuthenticatedRequest } from '../auth/authenticated-request.js';
import { ApiErrorResponseDto } from '../common/dto/api-error-response.dto.js';

@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth('access-token')
@ApiTags('Projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a project' })
  @ApiResponse({ status: 201 })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto })
  create(@Body() dto: CreateProjectDto, @Request() req: AuthenticatedRequest) {
    return this.projectsService.create(dto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List projects for authenticated user' })
  findAll(@Request() req: AuthenticatedRequest) {
    return this.projectsService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one project with tasks' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto })
  findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.projectsService.findOne(id, req.user.id);
  }

  @Get(':id/tasks')
  @ApiOperation({ summary: 'Get tasks for a project' })
  getTasks(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.projectsService.getProjectTasks(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a project' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.projectsService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a project' })
  remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.projectsService.remove(id, req.user.id);
  }
}
