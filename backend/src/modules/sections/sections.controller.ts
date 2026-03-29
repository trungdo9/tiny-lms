import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { SectionsService } from './sections.service';
import { CreateSectionDto, UpdateSectionDto, ReorderSectionsDto } from './dto/section.dto';

@ApiTags('sections')
@ApiBearerAuth()
@Controller()
export class SectionsController {
  constructor(private sectionsService: SectionsService) {}

  @Get('courses/:courseId/sections')
  @ApiOperation({ summary: 'List sections for a course' })
  @ApiResponse({ status: 200, description: 'List of sections' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findByCourse(@Param('courseId') courseId: string) {
    return this.sectionsService.findByCourse(courseId);
  }

  @Get('sections/:id')
  @ApiOperation({ summary: 'Get a section by ID' })
  @ApiResponse({ status: 200, description: 'Section found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Section not found' })
  async findOne(@Param('id') id: string) {
    return this.sectionsService.findOne(id);
  }

  @Post('courses/:courseId/sections')
  @UseGuards(SupabaseAuthGuard)
  @ApiOperation({ summary: 'Create a section in a course' })
  @ApiResponse({ status: 201, description: 'Section created' })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Param('courseId') courseId: string,
    @Body() dto: CreateSectionDto,
    @Request() req: any,
  ) {
    return this.sectionsService.create(courseId, dto, req.user.id, req.user.role);
  }

  @Put('sections/:id')
  @UseGuards(SupabaseAuthGuard)
  @ApiOperation({ summary: 'Update a section' })
  @ApiResponse({ status: 200, description: 'Section updated' })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Section not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSectionDto,
    @Request() req: any,
  ) {
    return this.sectionsService.update(id, dto, req.user.id, req.user.role);
  }

  @Delete('sections/:id')
  @UseGuards(SupabaseAuthGuard)
  @ApiOperation({ summary: 'Delete a section' })
  @ApiResponse({ status: 200, description: 'Section deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Section not found' })
  async delete(@Param('id') id: string, @Request() req: any) {
    return this.sectionsService.delete(id, req.user.id, req.user.role);
  }

  @Put('courses/:courseId/sections/reorder')
  @UseGuards(SupabaseAuthGuard)
  @ApiOperation({ summary: 'Reorder sections within a course' })
  @ApiResponse({ status: 200, description: 'Sections reordered' })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async reorder(
    @Param('courseId') courseId: string,
    @Body() dto: ReorderSectionsDto,
    @Request() req: any,
  ) {
    return this.sectionsService.reorder(courseId, dto.sectionIds, req.user.id, req.user.role);
  }
}
