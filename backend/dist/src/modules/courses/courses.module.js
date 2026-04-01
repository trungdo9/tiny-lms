"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoursesModule = void 0;
const common_1 = require("@nestjs/common");
const courses_controller_1 = require("./courses.controller");
const courses_service_1 = require("./courses.service");
const course_instructors_controller_1 = require("./course-instructors.controller");
const course_instructors_service_1 = require("./course-instructors.service");
const reviews_controller_1 = require("./reviews.controller");
const reviews_service_1 = require("./reviews.service");
const prisma_service_1 = require("../../common/prisma.service");
const roles_guard_1 = require("../../common/guards/roles.guard");
let CoursesModule = class CoursesModule {
};
exports.CoursesModule = CoursesModule;
exports.CoursesModule = CoursesModule = __decorate([
    (0, common_1.Module)({
        controllers: [courses_controller_1.CoursesController, course_instructors_controller_1.CourseInstructorsController, reviews_controller_1.ReviewsController],
        providers: [courses_service_1.CoursesService, course_instructors_service_1.CourseInstructorsService, reviews_service_1.ReviewsService, prisma_service_1.PrismaService, roles_guard_1.RolesGuard],
        exports: [courses_service_1.CoursesService],
    })
], CoursesModule);
//# sourceMappingURL=courses.module.js.map