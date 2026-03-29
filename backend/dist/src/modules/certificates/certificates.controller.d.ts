import type { Response } from 'express';
import { CertificatesService } from './certificates.service';
export declare class CertificatesController {
    private certificatesService;
    constructor(certificatesService: CertificatesService);
    issueCertificate(req: any, courseId: string): Promise<{
        id: string;
        courseId: string | null;
        pdfUrl: string | null;
        userId: string;
        certificateNumber: string | null;
        learningPathId: string | null;
        templateData: import("@prisma/client/runtime/client").JsonValue | null;
        issuedAt: Date;
    }>;
    getMyCertificates(req: any): Promise<({
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
    checkEligibility(req: any, courseId: string): Promise<{
        eligible: boolean;
        reason?: string;
    }>;
    verifyCertificate(certificateNumber: string): Promise<{
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
    getCertificate(id: string): Promise<{
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
    getCertificatePdf(id: string, res: Response): Promise<void>;
}
