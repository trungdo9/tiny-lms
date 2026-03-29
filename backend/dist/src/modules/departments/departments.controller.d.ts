import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/department.dto';
export declare class DepartmentsController {
    private readonly departmentsService;
    constructor(departmentsService: DepartmentsService);
    findAll(flat?: string): Promise<import("./departments.service").DepartmentTreeNode[] | {
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
}
