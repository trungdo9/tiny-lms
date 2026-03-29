import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/review.dto';
export declare class ReviewsController {
    private readonly reviewsService;
    constructor(reviewsService: ReviewsService);
    getStats(courseId: string): Promise<{
        averageRating: number | null;
        totalReviews: number;
        distribution: Record<string, number>;
    }>;
    findAll(courseId: string, page?: string, limit?: string): Promise<{
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
    upsert(courseId: string, req: any, dto: CreateReviewDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        courseId: string;
        userId: string;
        rating: number;
        comment: string | null;
    }>;
    delete(courseId: string, id: string, req: any): Promise<{
        deleted: boolean;
    }>;
}
