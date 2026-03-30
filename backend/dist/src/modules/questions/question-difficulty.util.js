"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUESTION_DIFFICULTY_ALIAS_MAP = exports.CANONICAL_QUESTION_DIFFICULTIES = void 0;
exports.normalizeQuestionDifficulty = normalizeQuestionDifficulty;
exports.normalizeQuestionDifficultyList = normalizeQuestionDifficultyList;
exports.normalizeOptionalQuestionDifficulty = normalizeOptionalQuestionDifficulty;
exports.isCanonicalQuestionDifficulty = isCanonicalQuestionDifficulty;
const common_1 = require("@nestjs/common");
exports.CANONICAL_QUESTION_DIFFICULTIES = ['easy', 'medium', 'hard'];
exports.QUESTION_DIFFICULTY_ALIAS_MAP = {
    easy: 'easy',
    beginner: 'easy',
    basic: 'easy',
    medium: 'medium',
    intermediate: 'medium',
    normal: 'medium',
    avg: 'medium',
    average: 'medium',
    hard: 'hard',
    advanced: 'hard',
    difficult: 'hard',
};
function normalizeQuestionDifficulty(input, options) {
    const defaultValue = options?.defaultValue;
    const fieldName = options?.fieldName || 'difficulty';
    if (input === undefined || input === null) {
        if (defaultValue)
            return defaultValue;
        throw new common_1.BadRequestException(`Unsupported ${fieldName}: value is required. Allowed values: easy, medium, hard`);
    }
    const normalizedInput = String(input).trim().toLowerCase();
    if (!normalizedInput) {
        if (defaultValue)
            return defaultValue;
        throw new common_1.BadRequestException(`Unsupported ${fieldName}: value is required. Allowed values: easy, medium, hard`);
    }
    const canonical = exports.QUESTION_DIFFICULTY_ALIAS_MAP[normalizedInput];
    if (!canonical) {
        throw new common_1.BadRequestException(`Unsupported ${fieldName}: ${input}. Allowed values: easy, medium, hard. Supported aliases: beginner/basic → easy; intermediate/normal/avg/average → medium; advanced/difficult → hard`);
    }
    return canonical;
}
function normalizeQuestionDifficultyList(input) {
    if (!input)
        return undefined;
    return input
        .split(',')
        .map((value) => normalizeQuestionDifficulty(value, { fieldName: 'difficulty filter' }))
        .filter((value, index, list) => list.indexOf(value) === index);
}
function normalizeOptionalQuestionDifficulty(input, fieldName = 'difficulty') {
    if (input === undefined || input === null)
        return undefined;
    return normalizeQuestionDifficulty(input, { fieldName });
}
function isCanonicalQuestionDifficulty(value) {
    if (!value)
        return false;
    return exports.CANONICAL_QUESTION_DIFFICULTIES.includes(value);
}
//# sourceMappingURL=question-difficulty.util.js.map