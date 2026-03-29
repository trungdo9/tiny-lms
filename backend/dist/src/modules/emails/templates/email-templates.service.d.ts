import { PrismaService } from '../../../common/prisma.service';
export interface EmailTemplateDto {
    slug: string;
    name: string;
    subject: string;
    body: string;
    isActive?: boolean;
}
export declare class EmailTemplatesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: string;
        name: string;
        slug: string;
        createdAt: Date;
        isActive: boolean;
        updatedAt: Date;
        subject: string;
        body: string;
    }[]>;
    findBySlug(slug: string): Promise<{
        id: string;
        name: string;
        slug: string;
        createdAt: Date;
        isActive: boolean;
        updatedAt: Date;
        subject: string;
        body: string;
    }>;
    create(data: EmailTemplateDto): Promise<{
        id: string;
        name: string;
        slug: string;
        createdAt: Date;
        isActive: boolean;
        updatedAt: Date;
        subject: string;
        body: string;
    }>;
    update(slug: string, data: Partial<EmailTemplateDto>): Promise<{
        id: string;
        name: string;
        slug: string;
        createdAt: Date;
        isActive: boolean;
        updatedAt: Date;
        subject: string;
        body: string;
    }>;
    delete(slug: string): Promise<{
        success: boolean;
    }>;
    render(template: {
        subject: string;
        body: string;
    }, variables: Record<string, string>): {
        subject: string;
        body: string;
    };
    seedDefaults(): Promise<{
        seeded: number;
    }>;
}
