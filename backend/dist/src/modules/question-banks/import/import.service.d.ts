export interface ImportQuestion {
    type: string;
    content: string;
    options: {
        content: string;
        isCorrect: boolean;
    }[];
    explanation?: string;
    difficulty?: string;
    defaultScore?: number;
    tags?: string[];
}
export interface ImportResult {
    questions: ImportQuestion[];
    errors: {
        row: number;
        error: string;
    }[];
}
export declare class ImportService {
    parseCSV(content: string): ImportResult;
    parseExcel(buffer: Buffer): ImportResult;
    private parseRow;
    generateTemplate(): string;
}
