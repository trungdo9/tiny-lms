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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttemptsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma.service");
let AttemptsService = class AttemptsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async start(quizId, userId) {
        const quiz = await this.prisma.quiz.findUnique({
            where: { id: quizId },
            include: {
                questions: {
                    include: {
                        question: { include: { options: true } },
                        bank: { include: { questions: { include: { options: true } } } },
                    },
                },
            },
        });
        if (!quiz) {
            throw new common_1.NotFoundException('Quiz not found');
        }
        if (!quiz.isPublished) {
            throw new common_1.BadRequestException('Quiz is not published');
        }
        const now = new Date();
        if (quiz.availableFrom && now < quiz.availableFrom) {
            throw new common_1.BadRequestException('Quiz is not yet available');
        }
        if (quiz.availableUntil && now > quiz.availableUntil) {
            throw new common_1.BadRequestException('Quiz is no longer available');
        }
        const attemptCount = await this.prisma.quizAttempt.count({
            where: { quizId, userId, status: { not: 'timed_out' } },
        });
        if (quiz.maxAttempts && attemptCount >= quiz.maxAttempts) {
            throw new common_1.BadRequestException('Maximum attempts reached');
        }
        let questions = [];
        for (const qq of quiz.questions) {
            if (qq.question) {
                questions.push(qq);
            }
            else if (qq.bankId && qq.pickCount) {
                const bank = qq.bank;
                if (bank) {
                    let bankQuestions = bank.questions;
                    if (qq.difficultyFilter) {
                        bankQuestions = bankQuestions.filter((q) => q.difficulty === qq.difficultyFilter);
                    }
                    if (qq.tagFilter && qq.tagFilter.length > 0) {
                        bankQuestions = bankQuestions.filter((q) => q.tags.some((tag) => qq.tagFilter.includes(tag)));
                    }
                    const shuffled = [...bankQuestions].sort(() => Math.random() - 0.5);
                    const picked = shuffled.slice(0, qq.pickCount);
                    for (const q of picked) {
                        questions.push({ ...qq, question: q, orderIndex: questions.length });
                    }
                }
            }
        }
        if (quiz.shuffleQuestions) {
            questions = [...questions].sort(() => Math.random() - 0.5);
        }
        questions = questions.map((q, idx) => ({ ...q, orderIndex: idx }));
        const questionsPerPage = quiz.paginationMode === 'one_by_one' ? 1 : (quiz.questionsPerPage || 1);
        questions = questions.map((q, idx) => ({
            ...q,
            pageNumber: Math.floor(idx / questionsPerPage) + 1,
        }));
        const expiresAt = quiz.timeLimitMinutes
            ? new Date(Date.now() + quiz.timeLimitMinutes * 60 * 1000)
            : null;
        const attempt = await this.prisma.quizAttempt.create({
            data: {
                quizId,
                userId,
                attemptNumber: attemptCount + 1,
                status: 'in_progress',
                currentPage: 1,
                expiresAt,
            },
        });
        for (const q of questions) {
            let optionsOrder = [];
            if (quiz.shuffleAnswers && q.question.options) {
                optionsOrder = [...q.question.options].sort(() => Math.random() - 0.5).map((o) => o.id);
            }
            else {
                optionsOrder = q.question.options?.map((o) => o.id) || [];
            }
            await this.prisma.attemptQuestion.create({
                data: {
                    attemptId: attempt.id,
                    questionId: q.question.id,
                    orderIndex: q.orderIndex,
                    optionsOrder,
                    pageNumber: q.pageNumber,
                },
            });
        }
        return this.getAttempt(attempt.id, userId);
    }
    async getAttempt(id, userId) {
        const attempt = await this.prisma.quizAttempt.findUnique({
            where: { id },
            include: {
                quiz: {
                    include: {
                        questions: {
                            include: {
                                question: { include: { options: true } },
                            },
                        },
                    },
                },
                attemptQuestions: {
                    include: {
                        question: { include: { options: true } },
                    },
                    orderBy: { orderIndex: 'asc' },
                },
                answers: true,
            },
        });
        if (!attempt) {
            throw new common_1.NotFoundException('Attempt not found');
        }
        if (attempt.userId !== userId) {
            throw new common_1.ForbiddenException('You can only view your own attempts');
        }
        const showAnswers = attempt.status !== 'in_progress' || attempt.quiz.showCorrectAnswer;
        return {
            ...attempt,
            attemptQuestions: attempt.attemptQuestions.map((aq) => ({
                ...aq,
                question: {
                    ...aq.question,
                    options: showAnswers
                        ? aq.question.options
                        : aq.question.options?.map((o) => ({ ...o, isCorrect: undefined })),
                },
            })),
        };
    }
    async getPage(attemptId, page, userId) {
        const attempt = await this.getAttempt(attemptId, userId);
        const pageQuestions = attempt.attemptQuestions.filter((aq) => aq.pageNumber === page);
        const answersMap = new Map(attempt.answers.map((a) => [a.questionId, a]));
        return {
            attempt: {
                id: attempt.id,
                status: attempt.status,
                currentPage: attempt.currentPage,
                totalPages: Math.max(...attempt.attemptQuestions.map((aq) => aq.pageNumber)),
                expiresAt: attempt.expiresAt,
                quiz: {
                    title: attempt.quiz.title,
                    timeLimitMinutes: attempt.quiz.timeLimitMinutes,
                    paginationMode: attempt.quiz.paginationMode,
                    allowBackNavigation: attempt.quiz.allowBackNavigation,
                    showCorrectAnswer: attempt.quiz.showCorrectAnswer,
                    showExplanation: attempt.quiz.showExplanation,
                },
            },
            questions: pageQuestions.map((aq) => ({
                id: aq.id,
                questionId: aq.questionId,
                orderIndex: aq.orderIndex,
                isFlagged: aq.isFlagged,
                isAnswered: !!answersMap.has(aq.questionId),
                question: {
                    content: aq.question.content,
                    type: aq.question.type,
                    mediaUrl: aq.question.mediaUrl,
                    explanation: attempt.status !== 'in_progress' ? aq.question.explanation : undefined,
                    options: aq.question.options?.map((o) => {
                        const isActive = attempt.status === 'in_progress';
                        const type = aq.question.type;
                        if (type === 'drag_drop_text') {
                            return { id: o.id, content: o.content, orderIndex: o.orderIndex };
                        }
                        if (type === 'drag_drop_image') {
                            return { id: o.id, content: o.content, orderIndex: o.orderIndex, matchValue: o.matchValue };
                        }
                        return {
                            id: o.id,
                            content: o.content,
                            orderIndex: o.orderIndex,
                            matchKey: o.matchKey,
                            matchValue: o.matchValue,
                            isCorrect: (!isActive || attempt.quiz.showCorrectAnswer) ? o.isCorrect : undefined,
                        };
                    }),
                },
                answer: answersMap.get(aq.questionId),
            })),
        };
    }
    async saveAnswer(attemptId, userId, dto) {
        const attempt = await this.prisma.quizAttempt.findUnique({ where: { id: attemptId } });
        if (!attempt) {
            throw new common_1.NotFoundException('Attempt not found');
        }
        if (attempt.userId !== userId) {
            throw new common_1.ForbiddenException('You can only answer your own attempts');
        }
        if (attempt.status !== 'in_progress') {
            throw new common_1.BadRequestException('Attempt already submitted');
        }
        const attemptQuestion = await this.prisma.attemptQuestion.findFirst({
            where: { attemptId, questionId: dto.questionId },
        });
        if (!attemptQuestion) {
            throw new common_1.BadRequestException('Question not part of this attempt');
        }
        const existingAnswer = await this.prisma.quizAnswer.findFirst({
            where: { attemptId, questionId: dto.questionId },
        });
        if (existingAnswer) {
            return this.prisma.quizAnswer.update({
                where: { id: existingAnswer.id },
                data: {
                    selectedOptions: dto.selectedOptions,
                    textAnswer: dto.textAnswer,
                    orderAnswer: dto.orderAnswer,
                    matchAnswer: dto.matchAnswer,
                },
            });
        }
        return this.prisma.quizAnswer.create({
            data: {
                attemptId,
                attemptQuestionId: attemptQuestion.id,
                questionId: dto.questionId,
                selectedOptions: dto.selectedOptions,
                textAnswer: dto.textAnswer,
                orderAnswer: dto.orderAnswer,
                matchAnswer: dto.matchAnswer,
            },
        });
    }
    async submit(attemptId, userId) {
        const attempt = await this.prisma.quizAttempt.findUnique({
            where: { id: attemptId },
            include: {
                attemptQuestions: {
                    include: { question: { include: { options: true } } },
                },
                answers: true,
                quiz: true,
            },
        });
        if (!attempt) {
            throw new common_1.NotFoundException('Attempt not found');
        }
        if (attempt.userId !== userId) {
            throw new common_1.ForbiddenException('You can only submit your own attempts');
        }
        if (attempt.status !== 'in_progress') {
            throw new common_1.BadRequestException('Attempt already submitted');
        }
        if (attempt.expiresAt && new Date() > attempt.expiresAt) {
            await this.prisma.quizAttempt.update({
                where: { id: attemptId },
                data: {
                    status: 'timed_out',
                    submittedAt: new Date(),
                    timeSpentSecs: Math.floor((attempt.expiresAt.getTime() - attempt.startedAt.getTime()) / 1000),
                },
            });
            throw new common_1.BadRequestException('Time limit exceeded. Your answers have been submitted.');
        }
        const timeSpent = Math.floor((Date.now() - attempt.startedAt.getTime()) / 1000);
        let totalScore = 0;
        let maxScore = 0;
        const gradedAnswers = [];
        for (const aq of attempt.attemptQuestions) {
            const question = aq.question;
            const answer = attempt.answers.find((a) => a.questionId === question.id);
            maxScore += Number(question.defaultScore) || 1;
            let isCorrect = false;
            let scoreEarned = 0;
            if (answer) {
                if (question.type === 'single' || question.type === 'true_false') {
                    const correctOption = question.options.find((o) => o.isCorrect);
                    if (correctOption && answer.selectedOptions?.includes(correctOption.id)) {
                        isCorrect = true;
                        scoreEarned = Number(question.defaultScore) || 1;
                    }
                }
                else if (question.type === 'multi') {
                    const correctOptions = question.options.filter((o) => o.isCorrect).map((o) => o.id);
                    const selected = answer.selectedOptions || [];
                    if (correctOptions.length > 0) {
                        const correctCount = selected.filter((id) => correctOptions.includes(id)).length;
                        const wrongCount = selected.filter((id) => !correctOptions.includes(id)).length;
                        const partialScore = (correctCount - wrongCount) / correctOptions.length;
                        if (partialScore > 0) {
                            isCorrect = partialScore === 1;
                            scoreEarned = Math.max(0, Math.round(partialScore * Number(question.defaultScore)));
                        }
                    }
                }
                else if (question.type === 'short_answer') {
                    const correctAnswer = question.options.find((o) => o.isCorrect)?.content;
                    if (correctAnswer && answer.textAnswer) {
                        const normalized = answer.textAnswer.trim().toLowerCase();
                        const normalizedCorrect = correctAnswer.trim().toLowerCase();
                        if (normalized === normalizedCorrect || normalizedCorrect.includes(normalized)) {
                            isCorrect = true;
                            scoreEarned = Number(question.defaultScore) || 1;
                        }
                    }
                }
                else if (question.type === 'matching') {
                    const matchAnswer = answer.matchAnswer;
                    if (matchAnswer) {
                        const correctMatches = question.options.filter((o) => o.matchKey);
                        let correctCount = 0;
                        for (const opt of correctMatches) {
                            if (matchAnswer[opt.id] === opt.matchValue) {
                                correctCount++;
                            }
                        }
                        if (correctMatches.length > 0) {
                            const matchScore = correctCount / correctMatches.length;
                            if (matchScore > 0) {
                                isCorrect = matchScore === 1;
                                scoreEarned = Math.round(matchScore * Number(question.defaultScore));
                            }
                        }
                    }
                }
                else if (question.type === 'ordering') {
                    const orderAnswer = answer.orderAnswer || [];
                    const correctOptions = question.options
                        .filter((o) => o.isCorrect)
                        .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
                    if (correctOptions.length > 0) {
                        const correctOrder = correctOptions.map((o) => o.id);
                        let correctCount = 0;
                        for (let i = 0; i < Math.min(orderAnswer.length, correctOrder.length); i++) {
                            if (orderAnswer[i] === correctOrder[i]) {
                                correctCount++;
                            }
                        }
                        const orderScore = correctCount / correctOrder.length;
                        if (orderScore > 0) {
                            isCorrect = orderScore === 1;
                            scoreEarned = Math.round(orderScore * Number(question.defaultScore));
                        }
                    }
                }
                else if (question.type === 'cloze') {
                    const textAnswer = answer.textAnswer?.trim().toLowerCase() || '';
                    const correctOptions = question.options.filter((o) => o.isCorrect);
                    if (correctOptions.length > 0 && textAnswer) {
                        let correctCount = 0;
                        for (const opt of correctOptions) {
                            const correctAns = opt.content.trim().toLowerCase();
                            if (textAnswer.includes(correctAns)) {
                                correctCount++;
                            }
                        }
                        const clozeScore = correctCount / correctOptions.length;
                        if (clozeScore > 0) {
                            isCorrect = clozeScore === 1;
                            scoreEarned = Math.round(clozeScore * Number(question.defaultScore));
                        }
                    }
                }
                else if (question.type === 'drag_drop_text') {
                    const matchAnswer = answer.matchAnswer;
                    if (matchAnswer) {
                        const correctTokens = question.options.filter((o) => o.isCorrect && o.matchKey);
                        let correctCount = 0;
                        for (const token of correctTokens) {
                            const placed = token.matchKey ? matchAnswer[token.matchKey] : undefined;
                            if (placed?.trim().toLowerCase() === token.content.trim().toLowerCase())
                                correctCount++;
                        }
                        if (correctTokens.length > 0) {
                            const ratio = correctCount / correctTokens.length;
                            isCorrect = ratio === 1;
                            scoreEarned = Math.round(ratio * Number(question.defaultScore));
                        }
                    }
                }
                else if (question.type === 'drag_drop_image') {
                    const matchAnswer = answer.matchAnswer;
                    if (matchAnswer) {
                        const zones = question.options.filter((o) => o.isCorrect && o.matchKey);
                        let correctCount = 0;
                        for (const zone of zones) {
                            const placed = matchAnswer[zone.id];
                            if (placed?.trim().toLowerCase() === zone.content.trim().toLowerCase())
                                correctCount++;
                        }
                        if (zones.length > 0) {
                            const ratio = correctCount / zones.length;
                            isCorrect = ratio === 1;
                            scoreEarned = Math.round(ratio * Number(question.defaultScore));
                        }
                    }
                }
            }
            totalScore += scoreEarned;
            if (answer) {
                await this.prisma.quizAnswer.update({
                    where: { id: answer.id },
                    data: { isCorrect, scoreEarned },
                });
            }
            await this.prisma.attemptQuestion.update({
                where: { id: aq.id },
                data: { score: scoreEarned },
            });
            gradedAnswers.push({ questionId: question.id, isCorrect, scoreEarned });
        }
        const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
        const passScore = attempt.quiz.passScore ? Number(attempt.quiz.passScore) : 0;
        const isPassed = percentage >= passScore;
        return this.prisma.quizAttempt.update({
            where: { id: attemptId },
            data: {
                status: 'submitted',
                submittedAt: new Date(),
                timeSpentSecs: timeSpent,
                totalScore,
                maxScore,
                percentage,
                isPassed,
            },
            include: {
                quiz: { select: { id: true, title: true, showResult: true, showCorrectAnswer: true, showExplanation: true } },
                attemptQuestions: {
                    include: {
                        question: { include: { options: true } },
                    },
                },
                answers: true,
            },
        });
    }
    async getResult(attemptId, userId) {
        const attempt = await this.getAttempt(attemptId, userId);
        if (attempt.status === 'in_progress') {
            throw new common_1.BadRequestException('Attempt not yet submitted');
        }
        const showCorrect = attempt.quiz.showCorrectAnswer;
        const showExplanation = attempt.quiz.showExplanation;
        return {
            ...attempt,
            attemptQuestions: attempt.attemptQuestions.map((aq) => ({
                ...aq,
                question: {
                    ...aq.question,
                    options: showCorrect
                        ? aq.question.options
                        : aq.question.options?.map((o) => ({ ...o, isCorrect: undefined })),
                    explanation: showExplanation ? aq.question.explanation : undefined,
                },
            })),
        };
    }
    async getUserAttempts(quizId, userId) {
        return this.prisma.quizAttempt.findMany({
            where: { quizId, userId },
            orderBy: { startedAt: 'desc' },
        });
    }
    async toggleFlag(attemptId, questionId, userId) {
        const attempt = await this.prisma.quizAttempt.findUnique({ where: { id: attemptId } });
        if (!attempt) {
            throw new common_1.NotFoundException('Attempt not found');
        }
        if (attempt.userId !== userId) {
            throw new common_1.ForbiddenException('You can only modify your own attempts');
        }
        if (attempt.status !== 'in_progress') {
            throw new common_1.BadRequestException('Cannot modify a submitted attempt');
        }
        const attemptQuestion = await this.prisma.attemptQuestion.findFirst({
            where: { attemptId, questionId },
        });
        if (!attemptQuestion) {
            throw new common_1.NotFoundException('Question not found in this attempt');
        }
        return this.prisma.attemptQuestion.update({
            where: { id: attemptQuestion.id },
            data: { isFlagged: !attemptQuestion.isFlagged },
        });
    }
    async getAllQuestions(attemptId, userId) {
        const attempt = await this.prisma.quizAttempt.findUnique({
            where: { id: attemptId },
            include: {
                attemptQuestions: {
                    include: {
                        question: { select: { id: true, content: true, type: true } },
                    },
                    orderBy: { orderIndex: 'asc' },
                },
                answers: true,
            },
        });
        if (!attempt) {
            throw new common_1.NotFoundException('Attempt not found');
        }
        if (attempt.userId !== userId) {
            throw new common_1.ForbiddenException('You can only view your own attempts');
        }
        const answersMap = new Map(attempt.answers.map((a) => [a.questionId, a]));
        return attempt.attemptQuestions.map((aq) => ({
            id: aq.id,
            questionId: aq.questionId,
            orderIndex: aq.orderIndex,
            pageNumber: aq.pageNumber,
            isFlagged: aq.isFlagged,
            isAnswered: !!answersMap.has(aq.questionId),
            question: aq.question,
        }));
    }
};
exports.AttemptsService = AttemptsService;
exports.AttemptsService = AttemptsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AttemptsService);
//# sourceMappingURL=attempts.service.js.map