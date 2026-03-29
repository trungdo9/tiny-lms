import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/department.dto';

export interface DepartmentTreeNode {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  status: string;
  orderIndex: number;
  children: DepartmentTreeNode[];
}

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(flat = false) {
    const departments = await this.prisma.department.findMany({
      orderBy: [{ orderIndex: 'asc' }, { name: 'asc' }],
    });
    return flat ? departments : this.buildTree(departments);
  }

  async findOne(id: string) {
    const dept = await this.prisma.department.findUnique({
      where: { id },
      include: { children: { orderBy: { orderIndex: 'asc' } } },
    });
    if (!dept) throw new NotFoundException('Department not found');
    return dept;
  }

  async create(dto: CreateDepartmentDto) {
    const org = await this.prisma.organization.findFirst();
    if (!org) throw new BadRequestException('No organization found. Please seed organization first.');

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

  async update(id: string, dto: UpdateDepartmentDto) {
    if (dto.parentId === id) {
      throw new BadRequestException('Department cannot be its own parent');
    }
    const data: any = { ...dto };
    if (dto.name) data.slug = this.generateSlug(dto.name);
    return this.prisma.department.update({ where: { id }, data });
  }

  async delete(id: string) {
    const children = await this.prisma.department.count({ where: { parentId: id } });
    if (children > 0) {
      throw new BadRequestException('Cannot delete department with sub-departments');
    }
    await this.prisma.profile.updateMany({
      where: { departmentId: id },
      data: { departmentId: null },
    });
    return this.prisma.department.delete({ where: { id } });
  }

  private buildTree(departments: any[]): DepartmentTreeNode[] {
    const map = new Map<string, DepartmentTreeNode>();
    const roots: DepartmentTreeNode[] = [];
    departments.forEach(d => map.set(d.id, { ...d, children: [] }));
    departments.forEach(d => {
      const node = map.get(d.id)!;
      if (d.parentId && map.has(d.parentId)) {
        map.get(d.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    });
    return roots;
  }

  private generateSlug(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      + '-' + Date.now().toString(36);
  }
}
