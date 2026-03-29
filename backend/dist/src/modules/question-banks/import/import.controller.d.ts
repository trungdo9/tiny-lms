import type { Response } from 'express';
import { ImportService } from './import.service';
export declare class ImportController {
    private importService;
    constructor(importService: ImportService);
    preview(bankId: string, content: string): import("./import.service").ImportResult;
    getTemplate(res: Response): void;
}
