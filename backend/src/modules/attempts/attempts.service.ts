import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { SaveAnswerDto, SubmitAttemptDto } from './dto/attempt.dto';

@Injectable()
export class AttemptsService {
  constructor(private prisma: PrismaService) {}

  async start(quizId: string, userId: string) {
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
      throw new NotFoundException('Quiz not found');
    }

    if (!quiz.isPublished) {
      throw new BadRequestException('Quiz is not published');
    }

    // Check quiz scheduling
    const now = new Date();
    if (quiz.availableFrom && now < quiz.availableFrom) {
      throw new BadRequestException('Quiz is not yet available');
    }
    if (quiz.availableUntil && now > quiz.availableUntil) {
      throw new BadRequestException('Quiz is no longer available');
    }

    // Check max attempts
    const attemptCount = await this.prisma.quizAttempt.count({
      where: { quizId, userId, status: { not: 'timed_out' } },
    });

    if (quiz.maxAttempts && attemptCount >= quiz.maxAttempts) {
      throw new BadRequestException('Maximum attempts reached');
    }

    // Build questions list
    let questions: any[] = [];

    for (const qq of quiz.questions) {
      if (qq.question) {
        // Fixed question
        questions.push(qq);
      } else if (qq.bankId && qq.pickCount) {
        // Random from bank
        const bank = qq.bank;
        if (bank) {
          let bankQuestions = bank.questions;

          // Filter by difficulty
          if (qq.difficultyFilter) {
            bankQuestions = bankQuestions.filter((q: any) => q.difficulty === qq.difficultyFilter);
          }

          // Filter by tags
          if (qq.tagFilter && qq.tagFilter.length > 0) {
            bankQuestions = bankQuestions.filter((q: any) =>
              q.tags.some((tag: string) => qq.tagFilter.includes(tag))
            );
          }

          // Shuffle and pick
          const shuffled = [...bankQuestions].sort(() => Math.random() - 0.5);
          const picked = shuffled.slice(0, qq.pickCount);

          for (const q of picked) {
            questions.push({ ...qq, question: q, orderIndex: questions.length });
          }
        }
      }
    }

    // Shuffle questions if needed
    if (quiz.shuffleQuestions) {
      questions = [...questions].sort(() => Math.random() - 0.5);
    }

    // Re-index order
    questions = questions.map((q, idx) => ({ ...q, orderIndex: idx }));

    // Assign page numbers
    const questionsPerPage = quiz.paginationMode === 'one_by_one' ? 1 : (quiz.questionsPerPage || 1);
    questions = questions.map((q, idx) => ({
      ...q,
      pageNumber: Math.floor(idx / questionsPerPage) + 1,
    }));

    // Create attempt with snapshot and timer
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

    // Create attempt questions
    for (const q of questions) {
      let optionsOrder: string[] = [];

      // Shuffle options if needed
      if (quiz.shuffleAnswers && q.question.options) {
        optionsOrder = [...q.question.options].sort(() => Math.random() - 0.5).map((o: any) => o.id);
      } else {
        optionsOrder = q.question.options?.map((o: any) => o.id) || [];
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

  async getAttempt(id: string, userId: string) {
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
      throw new NotFoundException('Attempt not found');
    }

    if (attempt.userId !== userId) {
      throw new ForbiddenException('You can only view your own attempts');
    }

    // Hide correct answers if needed
    const showAnswers = attempt.status !== 'in_progress' || attempt.quiz.showCorrectAnswer;

    return {
      ...attempt,
      attemptQuestions: attempt.attemptQuestions.map((aq) => ({
        ...aq,
        question: {
          ...aq.question,
          options: showAnswers
            ? aq.question.options
            : aq.question.options?.map((o: any) => ({ ...o, isCorrect: undefined })),
        },
      })),
    };
  }

  async getPage(attemptId: string, page: number, userId: string) {
    const attempt = await this.getAttempt(attemptId, userId);

    const pageQuestions = attempt.attemptQuestions.filter((aq) => aq.pageNumber === page);

    // Get existing answers
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
          mediaUrl: (aq.question as any).mediaUrl,
          explanation: attempt.status !== 'in_progress' ? aq.question.explanation : undefined,
          options: aq.question.options?.map((o: any) => {
            const isActive = attempt.status === 'in_progress';
            const type = aq.question.type;

            // drag_drop_text: strip matchKey (reveals slot) + isCorrect
            if (type === 'drag_drop_text') {
              return { id: o.id, content: o.content, orderIndex: o.orderIndex };
            }

            // drag_drop_image: expose matchValue (zone coords) but strip matchKey + isCorrect
            if (type === 'drag_drop_image') {
              return { id: o.id, content: o.content, orderIndex: o.orderIndex, matchValue: o.matchValue };
            }

            // All other types: expose matchKey + matchValue
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

  async saveAnswer(attemptId: string, userId: string, dto: SaveAnswerDto) {
    const attempt = await this.prisma.quizAttempt.findUnique({ where: { id: attemptId } });

    if (!attempt) {
      throw new NotFoundException('Attempt not found');
    }

    if (attempt.userId !== userId) {
      throw new ForbiddenException('You can only answer your own attempts');
    }

    if (attempt.status !== 'in_progress') {
      throw new BadRequestException('Attempt already submitted');
    }

    // Get attempt question
    const attemptQuestion = await this.prisma.attemptQuestion.findFirst({
      where: { attemptId, questionId: dto.questionId },
    });

    if (!attemptQuestion) {
      throw new BadRequestException('Question not part of this attempt');
    }

    // Upsert answer
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

  async submit(attemptId: string, userId: string) {
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
      throw new NotFoundException('Attempt not found');
    }

    if (attempt.userId !== userId) {
      throw new ForbiddenException('You can only submit your own attempts');
    }

    if (attempt.status !== 'in_progress') {
      throw new BadRequestException('Attempt already submitted');
    }

    // Check if time has expired
    if (attempt.expiresAt && new Date() > attempt.expiresAt) {
      // Auto-submit as timed out
      await this.prisma.quizAttempt.update({
        where: { id: attemptId },
        data: {
          status: 'timed_out',
          submittedAt: new Date(),
          timeSpentSecs: Math.floor((attempt.expiresAt.getTime() - attempt.startedAt.getTime()) / 1000),
        },
      });
      throw new BadRequestException('Time limit exceeded. Your answers have been submitted.');
    }

    // Calculate time spent
    const timeSpent = Math.floor((Date.now() - attempt.startedAt.getTime()) / 1000);

    // Score the attempt
    let totalScore = 0;
    let maxScore = 0;

    const gradedAnswers: { questionId: string; isCorrect: boolean; scoreEarned: number }[] = [];

    for (const aq of attempt.attemptQuestions) {
      const question = aq.question;
      const answer = attempt.answers.find((a) => a.questionId === question.id);

      maxScore += Number(question.defaultScore) || 1;

      let isCorrect = false;
      let scoreEarned = 0;

      if (answer) {
        if (question.type === 'single' || question.type === 'true_false') {
          const correctOption = question.options.find((o: any) => o.isCorrect);
          if (correctOption && answer.selectedOptions?.includes(correctOption.id)) {
            isCorrect = true;
            scoreEarned = Number(question.defaultScore) || 1;
          }
        } else if (question.type === 'multi') {
          const correctOptions = question.options.filter((o: any) => o.isCorrect).map((o: any) => o.id);
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
        } else if (question.type === 'short_answer') {
          const correctAnswer = question.options.find((o: any) => o.isCorrect)?.content;
          if (correctAnswer && answer.textAnswer) {
            const normalized = answer.textAnswer.trim().toLowerCase();
            const normalizedCorrect = correctAnswer.trim().toLowerCase();

            if (normalized === normalizedCorrect || normalizedCorrect.includes(normalized)) {
              isCorrect = true;
              scoreEarned = Number(question.defaultScore) || 1;
            }
          }
        } else if (question.type === 'matching') {
          // Match answer is JSON: { optionId: matchedOptionId }
          const matchAnswer = answer.matchAnswer as Record<string, string>;
          if (matchAnswer) {
            const correctMatches = question.options.filter((o: any) => o.matchKey);
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
        } else if (question.type === 'ordering') {
          // Order answer is array of option IDs in order
          const orderAnswer = answer.orderAnswer || [];
          const correctOptions = question.options
            .filter((o: any) => o.isCorrect)
            .sort((a: any, b: any) => (a.orderIndex || 0) - (b.orderIndex || 0));

          if (correctOptions.length > 0) {
            const correctOrder = correctOptions.map((o: any) => o.id);
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
        } else if (question.type === 'cloze') {
          // Cloze: text answer should contain correct answers
          // textAnswer format: "answer1, answer2, answer3" or array
          const textAnswer = answer.textAnswer?.trim().toLowerCase() || '';
          const correctOptions = question.options.filter((o: any) => o.isCorrect);

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
        } else if (question.type === 'drag_drop_text') {
          // matchAnswer keys = slot string IDs ("slot_0", "slot_1")
          const matchAnswer = answer.matchAnswer as Record<string, string> | null;
          if (matchAnswer) {
            const correctTokens = question.options.filter((o: any) => o.isCorrect && o.matchKey);
            let correctCount = 0;
            for (const token of correctTokens) {
              const placed = token.matchKey ? matchAnswer[token.matchKey] : undefined;
              if (placed?.trim().toLowerCase() === token.content.trim().toLowerCase()) correctCount++;
            }
            if (correctTokens.length > 0) {
              const ratio = correctCount / correctTokens.length;
              isCorrect = ratio === 1;
              scoreEarned = Math.round(ratio * Number(question.defaultScore));
            }
          }
        } else if (question.type === 'drag_drop_image') {
          // matchAnswer keys = zone option UUIDs
          const matchAnswer = answer.matchAnswer as Record<string, string> | null;
          if (matchAnswer) {
            const zones = question.options.filter((o: any) => o.isCorrect && o.matchKey);
            let correctCount = 0;
            for (const zone of zones) {
              const placed = matchAnswer[zone.id];
              if (placed?.trim().toLowerCase() === zone.content.trim().toLowerCase()) correctCount++;
            }
            if (zones.length > 0) {
              const ratio = correctCount / zones.length;
              isCorrect = ratio === 1;
              scoreEarned = Math.round(ratio * Number(question.defaultScore));
            }
          }
        }
        // Essay - manual grading (future)
      }

      totalScore += scoreEarned;

      // Update answer with score
      if (answer) {
        await this.prisma.quizAnswer.update({
          where: { id: answer.id },
          data: { isCorrect, scoreEarned },
        });
      }

      // Update attempt question score
      await this.prisma.attemptQuestion.update({
        where: { id: aq.id },
        data: { score: scoreEarned },
      });

      gradedAnswers.push({ questionId: question.id, isCorrect, scoreEarned });
    }

    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
    const passScore = attempt.quiz.passScore ? Number(attempt.quiz.passScore) : 0;
    const isPassed = percentage >= passScore;

    // Update attempt
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

  async getResult(attemptId: string, userId: string) {
    const attempt = await this.getAttempt(attemptId, userId);

    if (attempt.status === 'in_progress') {
      throw new BadRequestException('Attempt not yet submitted');
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
            : aq.question.options?.map((o: any) => ({ ...o, isCorrect: undefined })),
          explanation: showExplanation ? aq.question.explanation : undefined,
        },
      })),
    };
  }

  async getUserAttempts(quizId: string, userId: string) {
    return this.prisma.quizAttempt.findMany({
      where: { quizId, userId },
      orderBy: { startedAt: 'desc' },
    });
  }

  async toggleFlag(attemptId: string, questionId: string, userId: string) {
    const attempt = await this.prisma.quizAttempt.findUnique({ where: { id: attemptId } });

    if (!attempt) {
      throw new NotFoundException('Attempt not found');
    }

    if (attempt.userId !== userId) {
      throw new ForbiddenException('You can only modify your own attempts');
    }

    if (attempt.status !== 'in_progress') {
      throw new BadRequestException('Cannot modify a submitted attempt');
    }

    const attemptQuestion = await this.prisma.attemptQuestion.findFirst({
      where: { attemptId, questionId },
    });

    if (!attemptQuestion) {
      throw new NotFoundException('Question not found in this attempt');
    }

    return this.prisma.attemptQuestion.update({
      where: { id: attemptQuestion.id },
      data: { isFlagged: !attemptQuestion.isFlagged },
    });
  }

  async getAllQuestions(attemptId: string, userId: string) {
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
      throw new NotFoundException('Attempt not found');
    }

    if (attempt.userId !== userId) {
      throw new ForbiddenException('You can only view your own attempts');
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
}
