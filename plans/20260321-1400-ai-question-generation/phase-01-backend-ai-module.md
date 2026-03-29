# Phase 01 — Backend AI Questions Module

**Context:** [Parent Plan](plan.md) | [Backend Research](research/researcher-01-backend-report.md)
**Depends on:** Existing `questions` module (bulk create endpoint)

---

## Overview

| Field | Value |
|-------|-------|
| Date | 2026-03-21 |
| Description | New NestJS module `ai-questions` integrating OpenAI API for question generation |
| Priority | High |
| Implementation Status | 🔲 Pending |
| Review Status | 🔲 Not reviewed |

---

## Key Insights
- Bulk endpoint confirmed: `POST /questions/bank/:bankId/bulk` exists — frontend can use it to save AI questions in one call
- OpenAI structured output / JSON mode guarantees parseable response — no regex parsing needed
- GPT-4o-mini is sufficient for question generation and ~10x cheaper than GPT-4o
- No DB table needed for AI generation — stateless request/response
- Rate limiting via NestJS `@nestjs/throttler` or simple try/catch on OpenAI errors
- `OPENAI_API_KEY` stored in `backend/.env` — never in frontend

---

## Requirements
1. `POST /ai-questions/generate` endpoint — accepts topic, types, difficulty, count
2. Returns array of structured question objects matching existing Question+Option shape
3. Role guard: Instructor + Admin only
4. Validates count range (1-20), question types against allowed list
5. Graceful error handling: missing API key, rate limit (429), network errors
6. `OPENAI_API_KEY` in `backend/.env`

---

## Architecture

### Module Structure
```
backend/src/modules/ai-questions/
├── dto/
│   ├── generate-questions.dto.ts
│   └── ai-question.dto.ts
├── ai-questions.controller.ts
├── ai-questions.service.ts
└── ai-questions.module.ts
```

### DTO: GenerateQuestionsDto
```typescript
export class GenerateQuestionsDto {
  @IsString() @MinLength(3) @MaxLength(500)
  topic: string;                              // e.g. "JavaScript closures"

  @IsOptional() @IsString() @MaxLength(2000)
  context?: string;                           // additional text/excerpt

  @IsArray() @IsString({ each: true })
  @ArrayMinSize(1)
  types: ('single' | 'multi' | 'true_false' | 'short_answer' | 'essay')[];

  @IsString() @IsIn(['easy', 'medium', 'hard', 'mixed'])
  difficulty: string;                         // 'mixed' = let AI choose

  @IsInt() @Min(1) @Max(20)
  count: number;
}
```

### DTO: AIGeneratedQuestion (response shape)
```typescript
export class AIGeneratedQuestion {
  type: string;
  content: string;
  explanation?: string;
  difficulty: string;
  defaultScore: number;
  tags: string[];
  options: {
    content: string;
    isCorrect: boolean;
    matchKey?: string;
    matchValue?: string;
    orderIndex?: number;
  }[];
}
```

### OpenAI Integration Pattern
```typescript
// ai-questions.service.ts
import OpenAI from 'openai';

@Injectable()
export class AiQuestionsService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) throw new Error('OPENAI_API_KEY is not configured');
    this.openai = new OpenAI({ apiKey });
  }

  async generateQuestions(dto: GenerateQuestionsDto): Promise<AIGeneratedQuestion[]> {
    const systemPrompt = buildSystemPrompt();
    const userPrompt = buildUserPrompt(dto);

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const parsed = JSON.parse(response.choices[0].message.content);
    return this.validateAndTransform(parsed.questions);
  }
}
```

### System Prompt Strategy
```
You are an expert educator creating quiz questions for an LMS.
Return a JSON object with key "questions" containing an array of question objects.

Each question MUST have:
- type: one of [single, multi, true_false, short_answer, essay]
- content: the question text
- explanation: brief explanation of correct answer (optional but recommended)
- difficulty: easy | medium | hard
- defaultScore: number (1-5)
- tags: string[] of relevant topic tags
- options: array of options (see rules below)

Rules by type:
- single: 4 options, exactly 1 isCorrect=true
- multi: 4 options, 2-3 isCorrect=true
- true_false: exactly 2 options ["True","False"], exactly 1 isCorrect=true
- short_answer: exactly 1 option with isCorrect=true (the answer)
- essay: empty options array
```

### Controller
```typescript
// Use SupabaseAuthGuard + req.user.role check (same pattern as QuestionsController)
@Controller('ai-questions')
@UseGuards(SupabaseAuthGuard)
export class AiQuestionsController {
  @Post('generate')
  async generate(
    @Body() dto: GenerateQuestionsDto,
    @Request() req: any,
  ): Promise<AIGeneratedQuestion[]> {
    const role = req.user.role;
    if (role !== 'instructor' && role !== 'admin') {
      throw new ForbiddenException('Only instructors and admins can generate questions');
    }
    return this.aiQuestionsService.generateQuestions(dto);
  }
}
```

---

## Related Code Files
- `backend/src/modules/questions/questions.service.ts` — bulk create pattern to follow
- `backend/src/modules/questions/dto/question.dto.ts` — existing question shape
- `backend/src/common/guards/supabase-auth.guard.ts` — use SupabaseAuthGuard (same as QuestionsController)
- `backend/src/app.module.ts` — register new module here
- `backend/.env` — add `OPENAI_API_KEY`

---

## Implementation Steps

1. **Install dependency**
   ```bash
   cd backend && npm install openai
   ```

2. **Create module files** following the structure above

3. **Add `OPENAI_API_KEY` to `backend/.env`**
   ```
   OPENAI_API_KEY=sk-...
   ```

4. **Register module in `app.module.ts`**
   ```typescript
   import { AiQuestionsModule } from './modules/ai-questions/ai-questions.module';
   @Module({ imports: [..., AiQuestionsModule] })
   ```

5. **Implement `generate-questions.dto.ts`** with class-validator decorators

6. **Implement `ai-questions.service.ts`**:
   - Constructor: init OpenAI client from ConfigService
   - `buildSystemPrompt()` private method
   - `buildUserPrompt(dto)` private method
   - `validateAndTransform(raw)` private method — validate structure, fill defaults
   - Error handling: wrap in try/catch, map OpenAI errors to NestJS exceptions

7. **Implement `ai-questions.controller.ts`** — single POST endpoint

8. **Implement `ai-questions.module.ts`** — imports ConfigModule

9. **Test with curl/Postman** before frontend integration

---

## Todo
- [ ] `npm install openai` in backend
- [ ] Create `backend/src/modules/ai-questions/` directory and files
- [ ] Add `OPENAI_API_KEY` to backend `.env` and `.env.example`
- [ ] Register `AiQuestionsModule` in `app.module.ts`
- [ ] Implement DTOs, service, controller
- [ ] Manual test: POST `/ai-questions/generate` with sample topic
- [ ] Verify all 5 question types generate correctly structured options

---

## Success Criteria
- `POST /ai-questions/generate` returns valid question array in <15s
- Returns correct options structure per question type
- 401 for unauthenticated, 403 for students
- 400 if count > 20 or invalid type
- 500 with clear message if OPENAI_API_KEY missing or OpenAI API error

---

## Risk Assessment
| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| OpenAI rate limits | Medium | Try/catch → 429 error message to user |
| Malformed JSON from AI | Low | JSON mode + validateAndTransform fallback |
| High API costs | Low | GPT-4o-mini ~$0.0001/question; 20 questions ≈ $0.002 |
| Slow response (>30s) | Low | GPT-4o-mini fast; 20 questions ≈ 5-10s |

---

## Security Considerations
- `OPENAI_API_KEY` only in backend env — never sent to frontend
- Input sanitized via class-validator (MaxLength 500 on topic, 2000 on context)
- Role guard prevents student abuse
- No user prompt injection risk since we control the full prompt structure
- Consider request-level rate limiting per user if abuse suspected

---

## Next Steps
After phase 1: implement [Phase 02 — Frontend AI Generate Modal](phase-02-frontend-ai-modal.md)
