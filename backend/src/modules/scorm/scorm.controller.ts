import {
  Controller,
  Post,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { ScormService } from './scorm.service';
import { InitAttemptDto, UpdateAttemptDto } from './dto/scorm.dto';

@ApiTags('scorm')
@ApiBearerAuth()
@Controller('scorm')
@UseGuards(SupabaseAuthGuard)
export class ScormController {
  constructor(private readonly scormService: ScormService) {}

  @Post('upload/lesson/:lessonId')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
    }),
  )
  async uploadForLesson(
    @Param('lessonId') lessonId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.scormService.uploadPackage(file, { lessonId });
  }

  @Post('upload/course/:courseId')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 100 * 1024 * 1024 },
    }),
  )
  async uploadForCourse(
    @Param('courseId') courseId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.scormService.uploadPackage(file, { courseId });
  }

  @Get('package/lesson/:lessonId')
  async getPackageByLesson(@Param('lessonId') lessonId: string) {
    return this.scormService.getPackageByLesson(lessonId);
  }

  @Get('package/course/:courseId')
  async getPackageByCourse(@Param('courseId') courseId: string) {
    return this.scormService.getPackageByCourse(courseId);
  }

  @Post('attempts/init')
  async initAttempt(
    @Body(new ValidationPipe({ whitelist: true })) dto: InitAttemptDto,
    @Req() req: any,
  ) {
    return this.scormService.initAttempt(
      req.user.id,
      dto.packageId,
      dto.lessonId,
      dto.courseId,
    );
  }

  @Put('attempts/:id')
  async updateAttempt(
    @Param('id') id: string,
    @Body(new ValidationPipe({ whitelist: true })) dto: UpdateAttemptDto,
    @Req() req: any,
  ) {
    return this.scormService.updateAttempt(id, dto.values, req.user.id);
  }

  @Post('attempts/:id/finish')
  async finishAttempt(@Param('id') id: string, @Req() req: any) {
    return this.scormService.finishAttempt(id, req.user.id);
  }
}
