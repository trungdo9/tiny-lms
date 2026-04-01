import { AiQuestionsService } from './ai-questions.service';
import { GenerateQuestionsDto } from './dto/generate-questions.dto';
import { AIGeneratedQuestion } from './dto/ai-question.dto';
export declare class AiQuestionsController {
    private readonly aiQuestionsService;
    constructor(aiQuestionsService: AiQuestionsService);
    generate(dto: GenerateQuestionsDto, req: any): Promise<AIGeneratedQuestion[]>;
}
