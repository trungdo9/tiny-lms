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
exports.DepartmentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma.service");
let DepartmentsService = class DepartmentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(flat = false) {
        const departments = await this.prisma.department.findMany({
            orderBy: [{ orderIndex: 'asc' }, { name: 'asc' }],
        });
        return flat ? departments : this.buildTree(departments);
    }
    async findOne(id) {
        const dept = await this.prisma.department.findUnique({
            where: { id },
            include: { children: { orderBy: { orderIndex: 'asc' } } },
        });
        if (!dept)
            throw new common_1.NotFoundException('Department not found');
        return dept;
    }
    async create(dto) {
        const org = await this.prisma.organization.findFirst();
        if (!org)
            throw new common_1.BadRequestException('No organization found. Please seed organization first.');
        const slug = this.generateSlug(dto.name);
        return this.prisma.department.create({
            data: {
                name: dto.name,
                slug,
                description: dto.description,
                parentId: dto.parentId,
                organizationId: org.id,
                status: dto.status || 'active',
                orderIndex: dto.orderIndex ?? 0,
            },
        });
    }
    async update(id, dto) {
        if (dto.parentId === id) {
            throw new common_1.BadRequestException('Department cannot be its own parent');
        }
        const data = { ...dto };
        if (dto.name)
            data.slug = this.generateSlug(dto.name);
        return this.prisma.department.update({ where: { id }, data });
    }
    async delete(id) {
        const children = await this.prisma.department.count({ where: { parentId: id } });
        if (children > 0) {
            throw new common_1.BadRequestException('Cannot delete department with sub-departments');
        }
        await this.prisma.profile.updateMany({
            where: { departmentId: id },
            data: { departmentId: null },
        });
        return this.prisma.department.delete({ where: { id } });
    }
    buildTree(departments) {
        const map = new Map();
        const roots = [];
        departments.forEach(d => map.set(d.id, { ...d, children: [] }));
        departments.forEach(d => {
            const node = map.get(d.id);
            if (d.parentId && map.has(d.parentId)) {
                map.get(d.parentId).children.push(node);
            }
            else {
                roots.push(node);
            }
        });
        return roots;
    }
    generateSlug(name) {
        return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
            + '-' + Date.now().toString(36);
    }
};
exports.DepartmentsService = DepartmentsService;
exports.DepartmentsService = DepartmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DepartmentsService);
//# sourceMappingURL=departments.service.js.map