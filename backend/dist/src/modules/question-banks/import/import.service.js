"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportService = void 0;
const common_1 = require("@nestjs/common");
const sync_1 = require("csv-parse/sync");
const XLSX = __importStar(require("xlsx"));
const question_difficulty_util_1 = require("../../questions/question-difficulty.util");
let ImportService = class ImportService {
    parseCSV(content) {
        try {
            const records = (0, sync_1.parse)(content, {
                columns: true,
                skip_empty_lines: true,
                trim: true,
            });
            const questions = [];
            const errors = [];
            records.forEach((record, index) => {
                try {
                    const question = this.parseRow(record, index + 2);
                    if (question) {
                        questions.push(question);
                    }
                }
                catch (err) {
                    errors.push({ row: index + 2, error: err.message });
                }
            });
            return { questions, errors };
        }
        catch (err) {
            throw new common_1.BadRequestException(`CSV parse error: ${err.message}`);
        }
    }
    parseExcel(buffer) {
        try {
            const workbook = XLSX.read(buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const records = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
            const questions = [];
            const errors = [];
            records.forEach((record, index) => {
                try {
                    const question = this.parseRow(record, index + 2);
                    if (question) {
                        questions.push(question);
                    }
                }
                catch (err) {
                    errors.push({ row: index + 2, error: err.message });
                }
            });
            return { questions, errors };
        }
        catch (err) {
            throw new common_1.BadRequestException(`Excel parse error: ${err.message}`);
        }
    }
    parseRow(record, rowNumber) {
        const type = record.type?.toLowerCase().trim();
        const content = record.content?.trim();
        if (!type || !content) {
            throw new Error('Missing required fields: type, content');
        }
        const validTypes = ['single', 'multi', 'true_false', 'short_answer', 'matching', 'ordering', 'cloze'];
        if (!validTypes.includes(type)) {
            throw new Error(`Invalid question type: ${type}. Valid types: ${validTypes.join(', ')}`);
        }
        const options = [];
        if (type === 'single' || type === 'true_false') {
            const correct = record.correct?.toString().toUpperCase().trim();
            if (type === 'true_false') {
                options.push({ content: 'True', isCorrect: correct === 'TRUE' || correct === 'A' || correct === 'T' });
                options.push({ content: 'False', isCorrect: correct === 'FALSE' || correct === 'B' || correct === 'F' });
            }
            else {
                if (record.option_a)
                    options.push({ content: record.option_a, isCorrect: correct === 'A' });
                if (record.option_b)
                    options.push({ content: record.option_b, isCorrect: correct === 'B' });
                if (record.option_c)
                    options.push({ content: record.option_c, isCorrect: correct === 'C' });
                if (record.option_d)
                    options.push({ content: record.option_d, isCorrect: correct === 'D' });
            }
            const hasCorrect = options.some(o => o.isCorrect);
            if (!hasCorrect) {
                throw new Error('No correct answer specified');
            }
        }
        else if (type === 'multi') {
            const correctAnswers = record.correct?.toString().split(',').map((s) => s.trim().toUpperCase()) || [];
            if (record.option_a)
                options.push({ content: record.option_a, isCorrect: correctAnswers.includes('A') });
            if (record.option_b)
                options.push({ content: record.option_b, isCorrect: correctAnswers.includes('B') });
            if (record.option_c)
                options.push({ content: record.option_c, isCorrect: correctAnswers.includes('C') });
            if (record.option_d)
                options.push({ content: record.option_d, isCorrect: correctAnswers.includes('D') });
            const hasCorrect = options.some(o => o.isCorrect);
            if (!hasCorrect) {
                throw new Error('No correct answer specified');
            }
        }
        else if (type === 'short_answer') {
            options.push({ content: record.correct?.trim() || '', isCorrect: true });
        }
        else if (type === 'matching') {
            const correctPairs = record.correct?.toString().split(',').map((s) => s.trim()) || [];
            const allKeys = [record.option_a, record.option_b, record.option_c, record.option_d, record.option_e, record.option_f].filter(Boolean);
            const allValues = [record.match_a, record.match_b, record.match_c, record.match_d, record.match_e, record.match_f].filter(Boolean);
            if (allKeys.length > 0 && allValues.length > 0) {
                if (correctPairs.length > 0) {
                    correctPairs.forEach((pair) => {
                        const [key, value] = pair.split(':').map((s) => s.trim());
                        if (key && value) {
                            options.push({ content: key, isCorrect: true, matchKey: key, matchValue: value });
                        }
                    });
                }
                else {
                    const maxLen = Math.max(allKeys.length, allValues.length);
                    for (let i = 0; i < maxLen; i++) {
                        const key = allKeys[i] || '';
                        const value = allValues[i] || '';
                        if (key && value) {
                            options.push({ content: key, isCorrect: true, matchKey: key, matchValue: value });
                        }
                    }
                }
            }
            if (options.length === 0) {
                throw new Error('Matching requires key-value pairs in option_a-f and match_a-f columns');
            }
        }
        else if (type === 'ordering') {
            const orderStr = record.correct?.toString() || '1';
            const orderParts = orderStr.split(',').map((s) => s.trim());
            const allOptions = [record.option_a, record.option_b, record.option_c, record.option_d, record.option_e, record.option_f].filter(Boolean);
            if (allOptions.length === 0) {
                throw new Error('Ordering requires items in option_a-f columns');
            }
            allOptions.forEach((opt, idx) => {
                const orderIdx = orderParts[idx] ? parseInt(orderParts[idx]) - 1 : idx;
                options.push({ content: opt, isCorrect: true, orderIndex: orderIdx });
            });
        }
        else if (type === 'cloze') {
            const correctAnswers = record.correct?.toString().split(',').map((s) => s.trim()) || [];
            const blankMatches = content.match(/\{(\d+)?\}/g) || [];
            if (blankMatches.length === 0) {
                throw new Error('Cloze requires {blank} placeholders in content');
            }
            blankMatches.forEach((blank, idx) => {
                const answer = correctAnswers[idx] || '';
                if (!answer) {
                    throw new Error(`Missing answer for blank ${idx + 1}`);
                }
                options.push({ content: answer, isCorrect: true });
            });
        }
        let tags = [];
        if (record.tags) {
            tags = record.tags.split(',').map((s) => s.trim()).filter(Boolean);
        }
        return {
            type,
            content,
            options,
            explanation: record.explanation?.trim() || undefined,
            difficulty: (0, question_difficulty_util_1.normalizeQuestionDifficulty)(record.difficulty, { defaultValue: 'medium' }),
            defaultScore: parseInt(record.score) || 1,
            tags,
        };
    }
    generateTemplate() {
        const headers = ['type', 'content', 'option_a', 'option_b', 'option_c', 'option_d', 'match_a', 'match_b', 'match_c', 'match_d', 'correct', 'score', 'difficulty', 'explanation', 'tags'];
        const examples = [
            'single,"What is the capital of France?","Paris","London","Berlin","Madrid","","","","","A",1,easy,"Paris is the capital","geography,cities"',
            'multi,"Which are programming languages?","Python","HTML","CSS","Java","","","","","A,D",1,medium,"","programming"',
            'true_false,"The sun is a star.","True","False","","","","","","","A",1,easy,"","astronomy"',
            'short_answer,"What is 2+2?","","","","","","","","","4",1,easy,"","math"',
            'matching,"Match countries to capitals","France","Japan","Germany","","Paris","Tokyo","Berlin","","France:Paris,Japan:Tokyo,Germany:Berlin",1,medium,"","geography"',
            'ordering,"Arrange in order by size (small to large)","Atom","Cell","Planet","","","","","","1,2,3",1,easy,"","science"',
            'cloze,"The {1} is the largest planet in our solar system.","Jupiter","","","","","","","","1",1,easy,"","astronomy"',
        ];
        return [headers.join(','), ...examples].join('\n');
    }
};
exports.ImportService = ImportService;
exports.ImportService = ImportService = __decorate([
    (0, common_1.Injectable)()
], ImportService);
//# sourceMappingURL=import.service.js.map