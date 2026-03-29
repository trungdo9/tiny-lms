import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../common/prisma.service';
import { SupabaseService } from '../../common/supabase.service';
import { SettingsService } from '../settings/settings.service';
export declare class CertificatesService {
    private prisma;
    private supabase;
    private eventEmitter;
    private settingsService;
    constructor(prisma: PrismaService, supabase: SupabaseService, eventEmitter: EventEmitter2, settingsService: SettingsService);
    issueCertificate(userId: string, courseId: string): Promise<{
        id: string;
        courseId: string | null;
        pdfUrl: string | null;
        userId: string;
        certificateNumber: string | null;
        learningPathId: string | null;
        templateData: import("@prisma/client/runtime/client").JsonValue | null;
        issuedAt: Date;
    }>;
    checkCompletionEligibility(userId: string, courseId: string): Promise<boolean>;
    getMyCertificates(userId: string): Promise<({
        course: {
            id: string;
            slug: string;
            instructor: {
                id: string;
                fullName: string | null;
                avatarUrl: string | null;
            };
            title: string;
            thumbnailUrl: string | null;
        } | null;
        learningPath: {
            id: string;
            slug: string;
            title: string;
            thumbnailUrl: string | null;
        } | null;
    } & {
        id: string;
        courseId: string | null;
        pdfUrl: string | null;
        userId: string;
        certificateNumber: string | null;
        learningPathId: string | null;
        templateData: import("@prisma/client/runtime/client").JsonValue | null;
        issuedAt: Date;
    })[]>;
    getCertificateById(certificateId: string): Promise<{
        course: {
            id: string;
            slug: string;
            instructor: {
                id: string;
                fullName: string | null;
                avatarUrl: string | null;
            };
            title: string;
            thumbnailUrl: string | null;
        } | null;
        user: {
            id: string;
            fullName: string | null;
            avatarUrl: string | null;
        };
        learningPath: {
            id: string;
            slug: string;
            title: string;
        } | null;
    } & {
        id: string;
        courseId: string | null;
        pdfUrl: string | null;
        userId: string;
        certificateNumber: string | null;
        learningPathId: string | null;
        templateData: import("@prisma/client/runtime/client").JsonValue | null;
        issuedAt: Date;
    }>;
    generatePdf(certificateId: string): Promise<Buffer>;
    private generateCertNumber;
    handleLessonCompleted(payload: {
        userId: string;
        courseId: string;
    }): Promise<void>;
    issuePathCertificate(userId: string, pathId: string): Promise<{
        id: string;
        courseId: string | null;
        pdfUrl: string | null;
        userId: string;
        certificateNumber: string | null;
        learningPathId: string | null;
        templateData: import("@prisma/client/runtime/client").JsonValue | null;
        issuedAt: Date;
    }>;
    findByNumber(certificateNumber: string): Promise<{
        certificateNumber: string | null;
        issuedAt: Date;
        course: {
            slug: string;
            title: string;
        } | null;
        learningPath: {
            slug: string;
            title: string;
        } | null;
        title: string;
        holderName: string | null;
    }>;
    isEligibleForCertificate(userId: string, courseId: string): Promise<{
        eligible: boolean;
        reason?: string;
    }>;
}
