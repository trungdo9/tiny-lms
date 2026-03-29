import { SettingsService } from './settings.service';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    getPublic(): Promise<Record<string, unknown>>;
    findAll(): Promise<{
        value: unknown;
        key: string;
        type: string;
        isSecret: boolean | undefined;
    }[]>;
    findByCategory(category: string): Promise<{
        key: string;
        value: unknown;
        type: string;
        isSecret: boolean | undefined;
    }[]>;
    findOne(key: string): Promise<{
        key: string;
        value: unknown;
        type: string;
        isSecret: boolean | undefined;
    } | null>;
    update(key: string, body: {
        value: unknown;
        type?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        category: string;
        updatedAt: Date;
        type: string;
        key: string;
        value: string | null;
        isSecret: boolean;
    }>;
    remove(key: string): Promise<{
        success: boolean;
    }>;
    seed(): Promise<{
        seeded: number;
    }>;
}
