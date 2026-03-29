import { PrismaService } from '../../common/prisma.service';
import { CreateReviewDto } from './dto/review.dto';
export declare class ReviewsService {
    private prisma;
    constructor(prisma: PrismaService);
    upsert(courseId: string, userId: string, dto: CreateReviewDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        courseId: string;
        userId: string;
        rating: number;
        comment: string | null;
    }>;
    findAll(courseId: string, page?: number, limit?: number): Promise<{
        reviews: ({
            user: {
                id: string;
                fullName: string | null;
                avatarUrl: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            courseId: string;
            userId: string;
            rating: number;
            comment: string | null;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getStats(courseId: string): Promise<{
        averageRating: number | null;
        totalReviews: number;
        distribution: Record<string, number>;
    }>;
    delete(courseId: string, reviewId: string, userId: string, userRole: string): Promise<{
        deleted: boolean;
    }>;
    private recomputeRating;
}
