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
export declare class DepartmentsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(flat?: boolean): Promise<DepartmentTreeNode[] | {
        id: string;
        name: string;
        slug: string;
        createdAt: Date;
        parentId: string | null;
        updatedAt: Date;
        description: string | null;
        status: string;
        orderIndex: number;
        organizationId: string;
    }[]>;
    findOne(id: string): Promise<{
        children: {
            id: string;
            name: string;
            slug: string;
            createdAt: Date;
            parentId: string | null;
            updatedAt: Date;
            description: string | null;
            status: string;
            orderIndex: number;
            organizationId: string;
        }[];
    } & {
        id: string;
        name: string;
        slug: string;
        createdAt: Date;
        parentId: string | null;
        updatedAt: Date;
        description: string | null;
        status: string;
        orderIndex: number;
        organizationId: string;
    }>;
    create(dto: CreateDepartmentDto): Promise<{
        id: string;
        name: string;
        slug: string;
        createdAt: Date;
        parentId: string | null;
        updatedAt: Date;
        description: string | null;
        status: string;
        orderIndex: number;
        organizationId: string;
    }>;
    update(id: string, dto: UpdateDepartmentDto): Promise<{
        id: string;
        name: string;
        slug: string;
        createdAt: Date;
        parentId: string | null;
        updatedAt: Date;
        description: string | null;
        status: string;
        orderIndex: number;
        organizationId: string;
    }>;
    delete(id: string): Promise<{
        id: string;
        name: string;
        slug: string;
        createdAt: Date;
        parentId: string | null;
        updatedAt: Date;
        description: string | null;
        status: string;
        orderIndex: number;
        organizationId: string;
    }>;
    private buildTree;
    private generateSlug;
}
