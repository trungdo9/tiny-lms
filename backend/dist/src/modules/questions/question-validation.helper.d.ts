import { PrismaService } from '../../common/prisma.service';
import { CreateQuestionDto } from './dto/question.dto';
export declare function validateQuestionDto(dto: CreateQuestionDto): void;
export declare function checkBankOwnership(prisma: PrismaService, bankId: string, userId: string, userRole: string): Promise<{
    id: string;
    title: string;
    description: string | null;
    courseId: string | null;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}>;
