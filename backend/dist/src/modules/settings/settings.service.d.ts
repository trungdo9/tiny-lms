import { PrismaService } from '../../common/prisma.service';
import { SupabaseService } from '../../common/supabase.service';
export declare class SettingsService {
    private prisma;
    private supabaseService;
    constructor(prisma: PrismaService, supabaseService: SupabaseService);
    private shouldUseSupabaseFallback;
    get(key: string): Promise<{
        key: string;
        value: unknown;
        type: string;
        isSecret: boolean | undefined;
    } | null>;
    set(key: string, value: unknown, type?: string, isSecret?: boolean): Promise<{
        id: string;
        createdAt: Date;
        category: string;
        updatedAt: Date;
        type: string;
        key: string;
        value: string | null;
        isSecret: boolean;
    }>;
    getByCategory(category: string): Promise<{
        key: string;
        value: unknown;
        type: string;
        isSecret: boolean | undefined;
    }[]>;
    getPublic(): Promise<Record<string, unknown>>;
    getAll(): Promise<{
        value: unknown;
        key: string;
        type: string;
        isSecret: boolean | undefined;
    }[]>;
    delete(key: string): Promise<{
        success: boolean;
    }>;
    private parseValue;
    seedDefaults(): Promise<{
        seeded: number;
    }>;
}
