import { ConfigService } from '@nestjs/config';
import { GenerateQuestionsDto } from './dto/generate-questions.dto';
import { AIGeneratedQuestion } from './dto/ai-question.dto';
export declare class AiQuestionsService {
    private configService;
    private openai;
    constructor(configService: ConfigService);
    generateQuestions(dto: GenerateQuestionsDto): Promise<AIGeneratedQuestion[]>;
    private buildSystemPrompt;
    private buildUserPrompt;
    private validateAndTransform;
}
