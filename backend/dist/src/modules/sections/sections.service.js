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
exports.SectionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma.service");
const courses_service_1 = require("../courses/courses.service");
let SectionsService = class SectionsService {
    prisma;
    coursesService;
    constructor(prisma, coursesService) {
        this.prisma = prisma;
        this.coursesService = coursesService;
    }
    async findByCourse(courseId) {
        return this.prisma.section.findMany({
            where: { courseId },
            include: { lessons: { orderBy: { orderIndex: 'asc' } } },
            orderBy: { orderIndex: 'asc' },
        });
    }
    async findOne(id) {
        const section = await this.prisma.section.findUnique({
            where: { id },
            include: { lessons: { orderBy: { orderIndex: 'asc' } } },
        });
        if (!section) {
            throw new common_1.NotFoundException('Section not found');
        }
        return section;
    }
    async create(courseId, dto, userId, userRole = 'student') {
        await this.verifyCourseAccess(courseId, userId, userRole);
        const lastSection = await this.prisma.section.findFirst({
            where: { courseId },
            orderBy: { orderIndex: 'desc' },
            select: { orderIndex: true },
        });
        const orderIndex = dto.orderIndex ?? (lastSection ? lastSection.orderIndex + 1 : 0);
        return this.prisma.section.create({
            data: {
                courseId,
                title: dto.title,
                orderIndex,
            },
        });
    }
    async update(id, dto, userId, userRole = 'student') {
        const section = await this.findOne(id);
        await this.verifyCourseAccess(section.courseId, userId, userRole);
        const data = {};
        if (dto.title !== undefined)
            data.title = dto.title;
        if (dto.orderIndex !== undefined)
            data.orderIndex = dto.orderIndex;
        return this.prisma.section.update({
            where: { id },
            data,
        });
    }
    async delete(id, userId, userRole = 'student') {
        const section = await this.findOne(id);
        await this.verifyCourseAccess(section.courseId, userId, userRole);
        await this.prisma.section.delete({ where: { id } });
        return { success: true };
    }
    async reorder(courseId, sectionIds, userId, userRole = 'student') {
        await this.verifyCourseAccess(courseId, userId, userRole);
        await this.prisma.$transaction(sectionIds.map((id, index) => this.prisma.section.update({
            where: { id },
            data: { orderIndex: index },
        })));
        return { success: true };
    }
    async verifyCourseAccess(courseId, userId, userRole) {
        const course = await this.prisma.course.findUnique({
            where: { id: courseId },
            select: { id: true },
        });
        if (!course) {
            throw new common_1.NotFoundException('Course not found');
        }
        if (!(await this.coursesService.canManageCourse(courseId, userId, userRole))) {
            throw new common_1.ForbiddenException('You can only modify courses you are assigned to');
        }
    }
};
exports.SectionsService = SectionsService;
exports.SectionsService = SectionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        courses_service_1.CoursesService])
], SectionsService);
//# sourceMappingURL=sections.service.js.map