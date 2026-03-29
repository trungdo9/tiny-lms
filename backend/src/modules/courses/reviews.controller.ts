import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/review.dto';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';

@ApiTags('courses')
@Controller('courses/:courseId/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get review statistics for a course (public)' })
  @ApiResponse({ status: 200, description: 'Review stats returned' })
  getStats(@Param('courseId') courseId: string) {
    return this.reviewsService.getStats(courseId);
  }

  @Get()
  @ApiOperation({ summary: 'List reviews for a course (public)' })
  @ApiResponse({ status: 200, description: 'List of reviews' })
  findAll(
    @Param('courseId') courseId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.reviewsService.findAll(
      courseId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
    );
  }

  @Post()
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create or update a review for a course' })
  @ApiResponse({ status: 201, description: 'Review created or updated' })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  upsert(
    @Param('courseId') courseId: string,
    @Request() req: any,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.upsert(courseId, req.user.id, dto);
  }

  @Delete(':id')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a review' })
  @ApiResponse({ status: 200, description: 'Review deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  delete(
    @Param('courseId') courseId: string,
    @Param('id') id: string,
    @Request() req: any,
  ) {
    return this.reviewsService.delete(courseId, id, req.user.id, req.user.role);
  }
}
