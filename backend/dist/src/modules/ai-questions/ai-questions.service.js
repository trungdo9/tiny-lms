"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiQuestionsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const openai_1 = __importDefault(require("openai"));
let AiQuestionsService = class AiQuestionsService {
    configService;
    openai;
    constructor(configService) {
        this.configService = configService;
        const apiKey = this.configService.get('OPENAI_API_KEY');
        if (!apiKey) {
            throw new common_1.InternalServerErrorException('OPENAI_API_KEY is not configured');
        }
        this.openai = new openai_1.default({ apiKey });
    }
    async generateQuestions(dto) {
        try {
            const systemPrompt = this.buildSystemPrompt();
            const userPrompt = this.buildUserPrompt(dto);
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt },
                ],
                response_format: { type: 'json_object' },
                temperature: 0.7,
            });
            const content = response.choices[0].message.content;
            if (!content) {
                throw new common_1.InternalServerErrorException('Empty response from OpenAI');
            }
            const parsed = JSON.parse(content);
            if (!parsed.questions || !Array.isArray(parsed.questions)) {
                throw new common_1.InternalServerErrorException('Invalid response format from OpenAI');
            }
            return this.validateAndTransform(parsed.questions);
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException || error instanceof common_1.InternalServerErrorException) {
                throw error;
            }
            if (error instanceof openai_1.default.APIError) {
                if (error.status === 429) {
                    throw new common_1.BadRequestException('OpenAI rate limit exceeded. Please try again later.');
                }
                throw new common_1.InternalServerErrorException(`OpenAI API error: ${error.message}`);
            }
            throw new common_1.InternalServerErrorException(`Failed to generate questions: ${error.message}`);
        }
    }
    buildSystemPrompt() {
        return `You are an expert educator creating quiz questions for an LMS.
Return a JSON object with key "questions" containing an array of question objects.

Each question MUST have:
- type: one of [single, multi, true_false, short_answer, essay]
- content: the question text (clear, concise, appropriate for assessment)
- explanation: brief explanation of why the correct answer is right (optional but recommended)
- difficulty: easy | medium | hard
- defaultScore: number (1-5, default to 1)
- tags: string[] of relevant topic tags
- options: array of options (see rules below)

Rules by type:
- single: 4 options, exactly 1 isCorrect=true
- multi: 4 options, 2-3 isCorrect=true
- true_false: exactly 2 options ["True","False"], exactly 1 isCorrect=true
- short_answer: exactly 1 option with isCorrect=true (the answer text)
- essay: empty options array

Return between 1 and 20 questions based on the user's count parameter.`;
    }
    buildUserPrompt(dto) {
        const typeList = dto.types.join(', ');
        let prompt = `Generate ${dto.count} quiz question(s) about: ${dto.topic}\n\n`;
        prompt += `Question types to include: ${typeList}\n`;
        prompt += `Difficulty: ${dto.difficulty}\n`;
        if (dto.context) {
            prompt += `\nAdditional context:\n${dto.context}\n`;
        }
        prompt += `\nGenerate exactly ${dto.count} question(s) in JSON format.`;
        return prompt;
    }
    validateAndTransform(questions) {
        const validTypes = ['single', 'multi', 'true_false', 'short_answer', 'essay'];
        const validDifficulties = ['easy', 'medium', 'hard'];
        return questions.map((q, index) => {
            if (!q.type || !validTypes.includes(q.type)) {
                throw new common_1.InternalServerErrorException(`Invalid question type at index ${index}`);
            }
            const options = [];
            if (q.type === 'single' || q.type === 'multi') {
                if (!Array.isArray(q.options) || q.options.length < 2) {
                    throw new common_1.InternalServerErrorException(`Question at index ${index} must have at least 2 options`);
                }
                options.push(...q.options.map((opt, i) => ({
                    content: opt.content || '',
                    isCorrect: Boolean(opt.isCorrect),
                    orderIndex: i,
                })));
            }
            else if (q.type === 'true_false') {
                options.push({ content: 'True', isCorrect: q.options?.[0]?.isCorrect === true, orderIndex: 0 }, { content: 'False', isCorrect: q.options?.[1]?.isCorrect === true || (q.options?.[0]?.isCorrect === false), orderIndex: 1 });
            }
            else if (q.type === 'short_answer') {
                options.push({
                    content: q.options?.[0]?.content || q.answer || '',
                    isCorrect: true,
                    orderIndex: 0,
                });
            }
            return {
                type: q.type,
                content: q.content || '',
                explanation: q.explanation || undefined,
                difficulty: validDifficulties.includes(q.difficulty) ? q.difficulty : 'medium',
                defaultScore: typeof q.defaultScore === 'number' && q.defaultScore >= 1 && q.defaultScore <= 5 ? q.defaultScore : 1,
                tags: Array.isArray(q.tags) ? q.tags : [],
                options,
            };
        });
    }
};
exports.AiQuestionsService = AiQuestionsService;
exports.AiQuestionsService = AiQuestionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AiQuestionsService);
//# sourceMappingURL=ai-questions.service.js.map