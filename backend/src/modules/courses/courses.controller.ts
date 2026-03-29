import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CoursesService } from './courses.service';
import { CreateCourseDto, UpdateCourseDto, CourseQueryDto, CloneCourseDto, CreateCategoryDto, UpdateCategoryDto } from './dto/course.dto';

@ApiTags('courses')
@Controller('courses')
export class CoursesController {
  constructor(private coursesService: CoursesService) { }

  @Get()
  @ApiOperation({ summary: 'List all courses (public)' })
  @ApiResponse({ status: 200, description: 'List of courses' })
  async findAll(@Query() query: CourseQueryDto) {
    return this.coursesService.findAll(query);
  }

  @Get('my-courses')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get courses enrolled by the current user' })
  @ApiResponse({ status: 200, description: 'List of enrolled courses' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findMyCourses(@Request() req: any) {
    return this.coursesService.findMyCourses(req.user.id);
  }

  @Get('instructor')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get courses owned/taught by the current instructor' })
  @ApiResponse({ status: 200, description: 'List of instructor courses' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findInstructorCourses(
    @Request() req: any,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.coursesService.findInstructorCourses(req.user.id, req.user.role, { search, status });
  }

  @Get('categories')
  @ApiOperation({ summary: 'List all course categories (public)' })
  @ApiResponse({ status: 200, description: 'List of categories' })
  async getCategories() {
    return this.coursesService.getCategories();
  }

  @Get('categories/:id')
  @ApiOperation({ summary: 'Get a category by ID (public)' })
  @ApiResponse({ status: 200, description: 'Category found' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async getCategoryById(@Param('id') id: string) {
    return this.coursesService.getCategoryById(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a course by ID (public)' })
  @ApiResponse({ status: 200, description: 'Course found' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Post()
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new course' })
  @ApiResponse({ status: 201, description: 'Course created' })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Body() dto: CreateCourseDto, @Request() req: any) {
    return this.coursesService.create(dto, req.user.id);
  }

  @Post('categories')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new category (admin only)' })
  @ApiResponse({ status: 201, description: 'Category created' })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createCategory(@Body() dto: CreateCategoryDto) {
    return this.coursesService.createCategory(dto.name, dto.slug, dto.parentId);
  }

  @Put('categories/:id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a category (admin only)' })
  @ApiResponse({ status: 200, description: 'Category updated' })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async updateCategory(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.coursesService.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a category (admin only)' })
  @ApiResponse({ status: 200, description: 'Category deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async deleteCategory(@Param('id') id: string) {
    return this.coursesService.deleteCategory(id);
  }

  @Put(':id')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a course' })
  @ApiResponse({ status: 200, description: 'Course updated' })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCourseDto,
    @Request() req: any,
  ) {
    return this.coursesService.update(id, dto, req.user.id, req.user.role);
  }

  @Delete(':id')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a course' })
  @ApiResponse({ status: 200, description: 'Course deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async delete(@Param('id') id: string, @Request() req: any) {
    return this.coursesService.delete(id, req.user.id, req.user.role);
  }

  /** Deep-clone a course with its sections, lessons, and optionally quizzes. */
  @Post(':id/clone')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Clone a course with its sections and lessons' })
  @ApiResponse({ status: 201, description: 'Course cloned' })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async clone(
    @Param('id') id: string,
    @Body() dto: CloneCourseDto,
    @Request() req: any,
  ) {
    return this.coursesService.clone(id, req.user.id, dto, req.user.role);
  }
}
