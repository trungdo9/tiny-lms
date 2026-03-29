"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LessonsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma.service");
const courses_service_1 = require("../courses/courses.service");
let LessonsService = class LessonsService {
    prisma;
    coursesService;
    constructor(prisma, coursesService) {
        this.prisma = prisma;
        this.coursesService = coursesService;
    }
    async syncCourseLessonCount(courseId, tx = this.prisma) {
        const lessonCount = await tx.lesson.count({ where: { courseId } });
        await tx.course.update({
            where: { id: courseId },
            data: { lessonCount },
        });
    }
    async findBySection(sectionId) {
        return this.prisma.lesson.findMany({
            where: { sectionId },
            orderBy: { orderIndex: 'asc' },
        });
    }
    async findOne(id) {
        const lesson = await this.prisma.lesson.findUnique({
            where: { id },
            include: {
                section: { select: { id: true, title: true, courseId: true } },
            },
        });
        if (!lesson) {
            throw new common_1.NotFoundException('Lesson not found');
        }
        return lesson;
    }
    async findOneForLearning(id, userId) {
        const lesson = await this.findOne(id);
        const canAccess = await this.canAccessLesson(lesson, userId);
        if (!canAccess) {
            throw new common_1.ForbiddenException('You must enroll in this course to access this lesson');
        }
        const prereqMet = await this.checkPrerequisite(id, userId);
        if (!prereqMet) {
            throw new common_1.ForbiddenException('You must complete the prerequisite lesson first');
        }
        const enrollment = await this.prisma.enrollment.findUnique({
            where: { userId_courseId: { userId, courseId: lesson.courseId } },
        });
        if (enrollment && !this.isLessonAvailable(lesson, enrollment)) {
            throw new common_1.ForbiddenException('This lesson is not yet available');
        }
        const progress = await this.prisma.lessonProgress.findUnique({
            where: { userId_lessonId: { userId, lessonId: id } },
        });
        return {
            ...lesson,
            userProgress: progress,
        };
    }
    async create(sectionId, dto, userId, userRole = 'student') {
        const section = await this.prisma.section.findUnique({
            where: { id: sectionId },
            select: { id: true, courseId: true },
        });
        if (!section) {
            throw new common_1.NotFoundException('Section not found');
        }
        await this.verifyCourseAccess(section.courseId, userId, userRole);
        const lastLesson = await this.prisma.lesson.findFirst({
            where: { sectionId },
            orderBy: { orderIndex: 'desc' },
            select: { orderIndex: true },
        });
        const orderIndex = dto.orderIndex ?? (lastLesson ? lastLesson.orderIndex + 1 : 0);
        return this.prisma.$transaction(async (tx) => {
            const lesson = await tx.lesson.create({
                data: {
                    sectionId,
                    courseId: section.courseId,
                    title: dto.title,
                    type: dto.type,
                    content: dto.content,
                    videoUrl: dto.videoUrl,
                    videoProvider: dto.videoProvider,
                    pdfUrl: dto.pdfUrl,
                    durationMins: dto.durationMins,
                    orderIndex,
                    isPreview: dto.isPreview ?? false,
                    isPublished: dto.isPublished ?? false,
                    prerequisiteLessonId: dto.prerequisiteLessonId,
                    availableAfterDays: dto.availableAfterDays,
                },
            });
            await this.syncCourseLessonCount(section.courseId, tx);
            return lesson;
        });
    }
    async update(id, dto, userId, userRole = 'student') {
        const lesson = await this.findOne(id);
        await this.verifyCourseAccess(lesson.courseId, userId, userRole);
        const data = {};
        if (dto.title !== undefined)
            data.title = dto.title;
        if (dto.type !== undefined)
            data.type = dto.type;
        if (dto.content !== undefined)
            data.content = dto.content;
        if (dto.videoUrl !== undefined)
            data.videoUrl = dto.videoUrl;
        if (dto.videoProvider !== undefined)
            data.videoProvider = dto.videoProvider;
        if (dto.pdfUrl !== undefined)
            data.pdfUrl = dto.pdfUrl;
        if (dto.durationMins !== undefined)
            data.durationMins = dto.durationMins;
        if (dto.orderIndex !== undefined)
            data.orderIndex = dto.orderIndex;
        if (dto.isPreview !== undefined)
            data.isPreview = dto.isPreview;
        if (dto.isPublished !== undefined)
            data.isPublished = dto.isPublished;
        if (dto.prerequisiteLessonId !== undefined) {
            if (dto.prerequisiteLessonId) {
                const prereq = await this.prisma.lesson.findUnique({
                    where: { id: dto.prerequisiteLessonId },
                    select: { courseId: true },
                });
                if (!prereq || prereq.courseId !== lesson.courseId) {
                    throw new common_1.BadRequestException('Prerequisite lesson must be in the same course');
                }
                if (dto.prerequisiteLessonId === id) {
                    throw new common_1.BadRequestException('A lesson cannot be its own prerequisite');
                }
            }
            data.prerequisiteLessonId = dto.prerequisiteLessonId;
        }
        if (dto.availableAfterDays !== undefined)
            data.availableAfterDays = dto.availableAfterDays;
        return this.prisma.lesson.update({
            where: { id },
            data,
        });
    }
    async delete(id, userId, userRole = 'student') {
        const lesson = await this.findOne(id);
        await this.verifyCourseAccess(lesson.courseId, userId, userRole);
        await this.prisma.$transaction(async (tx) => {
            await tx.lesson.delete({ where: { id } });
            await this.syncCourseLessonCount(lesson.courseId, tx);
        });
        return { success: true };
    }
    async reorder(sectionId, lessonIds, userId, userRole = 'student') {
        const section = await this.prisma.section.findUnique({
            where: { id: sectionId },
            select: { courseId: true },
        });
        if (!section) {
            throw new common_1.NotFoundException('Section not found');
        }
        await this.verifyCourseAccess(section.courseId, userId, userRole);
        await this.prisma.$transaction(lessonIds.map((id, index) => this.prisma.lesson.update({
            where: { id },
            data: { orderIndex: index },
        })));
        return { success: true };
    }
    async canAccessLesson(lesson, userId) {
        if (lesson.isPreview)
            return true;
        const enrollment = await this.prisma.enrollment.findUnique({
            where: { userId_courseId: { userId, courseId: lesson.courseId } },
        });
        return !!enrollment;
    }
    async verifyCourseAccess(courseId, userId, userRole) {
        if (!(await this.coursesService.canManageCourse(courseId, userId, userRole))) {
            throw new common_1.ForbiddenException('You can only modify courses you are assigned to');
        }
    }
    async checkPrerequisite(lessonId, userId) {
        const lesson = await this.prisma.lesson.findUnique({
            where: { id: lessonId },
            select: { prerequisiteLessonId: true, isPreview: true },
        });
        if (!lesson?.prerequisiteLessonId || lesson.isPreview)
            return true;
        const progress = await this.prisma.lessonProgress.findUnique({
            where: { userId_lessonId: { userId, lessonId: lesson.prerequisiteLessonId } },
        });
        return progress?.isCompleted ?? false;
    }
    isLessonAvailable(lesson, enrollment) {
        if (lesson.isPreview)
            return true;
        if (lesson.availableFrom && new Date() < new Date(lesson.availableFrom))
            return false;
        if (lesson.availableAfterDays && enrollment?.enrolledAt) {
            const unlockDate = new Date(enrollment.enrolledAt);
            unlockDate.setDate(unlockDate.getDate() + lesson.availableAfterDays);
            return new Date() >= unlockDate;
        }
        return true;
    }
};
exports.LessonsService = LessonsService;
exports.LessonsService = LessonsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        courses_service_1.CoursesService])
], LessonsService);
//# sourceMappingURL=lessons.service.js.map