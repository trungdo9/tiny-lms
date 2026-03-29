"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CertificatesService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const prisma_service_1 = require("../../common/prisma.service");
const supabase_service_1 = require("../../common/supabase.service");
const settings_service_1 = require("../settings/settings.service");
const contact_sync_events_1 = require("../contact-sync/contact-sync.events");
const PDFDocument = __importStar(require("pdfkit"));
const QRCode = __importStar(require("qrcode"));
let CertificatesService = class CertificatesService {
    prisma;
    supabase;
    eventEmitter;
    settingsService;
    constructor(prisma, supabase, eventEmitter, settingsService) {
        this.prisma = prisma;
        this.supabase = supabase;
        this.eventEmitter = eventEmitter;
        this.settingsService = settingsService;
    }
    async issueCertificate(userId, courseId) {
        const enrollment = await this.prisma.enrollment.findUnique({
            where: {
                userId_courseId: { userId, courseId },
            },
        });
        if (!enrollment) {
            throw new common_1.BadRequestException('User is not enrolled in this course');
        }
        const existingCert = await this.prisma.certificate.findUnique({
            where: {
                userId_courseId: { userId, courseId },
            },
        });
        if (existingCert) {
            return existingCert;
        }
        const isEligible = await this.checkCompletionEligibility(userId, courseId);
        if (!isEligible) {
            throw new common_1.BadRequestException('Course not completed yet');
        }
        const certificateNumber = await this.generateCertNumber();
        const certificate = await this.prisma.certificate.create({
            data: {
                userId,
                courseId,
                certificateNumber,
            },
        });
        this.eventEmitter.emit(contact_sync_events_1.CONTACT_SYNC_EVENTS.COURSE_COMPLETED, { userId, courseId });
        return certificate;
    }
    async checkCompletionEligibility(userId, courseId) {
        const course = await this.prisma.course.findUnique({
            where: { id: courseId },
            include: {
                sections: {
                    include: {
                        lessons: {
                            where: { isPublished: true },
                        },
                    },
                },
                quizzes: {
                    where: { isPublished: true, passScore: { not: null } },
                },
            },
        });
        if (!course) {
            return false;
        }
        const lessonIds = [];
        for (const section of course.sections) {
            for (const lesson of section.lessons) {
                lessonIds.push(lesson.id);
            }
        }
        if (lessonIds.length > 0) {
            const completedLessons = await this.prisma.lessonProgress.count({
                where: {
                    userId,
                    lessonId: { in: lessonIds },
                    isCompleted: true,
                },
            });
            if (completedLessons === lessonIds.length) {
                return true;
            }
        }
        if (course.quizzes.length > 0) {
            const quizPassed = await this.prisma.quizAttempt.findFirst({
                where: {
                    userId,
                    quizId: { in: course.quizzes.map((q) => q.id) },
                    status: 'submitted',
                    isPassed: true,
                },
            });
            if (quizPassed) {
                return true;
            }
        }
        return false;
    }
    async getMyCertificates(userId) {
        return this.prisma.certificate.findMany({
            where: { userId },
            include: {
                course: {
                    select: {
                        id: true, title: true, slug: true, thumbnailUrl: true,
                        instructor: { select: { id: true, fullName: true, avatarUrl: true } },
                    },
                },
                learningPath: {
                    select: { id: true, title: true, slug: true, thumbnailUrl: true },
                },
            },
            orderBy: { issuedAt: 'desc' },
        });
    }
    async getCertificateById(certificateId) {
        const certificate = await this.prisma.certificate.findUnique({
            where: { id: certificateId },
            include: {
                course: {
                    select: {
                        id: true, title: true, slug: true, thumbnailUrl: true,
                        instructor: { select: { id: true, fullName: true, avatarUrl: true } },
                    },
                },
                learningPath: { select: { id: true, title: true, slug: true } },
                user: { select: { id: true, fullName: true, avatarUrl: true } },
            },
        });
        if (!certificate) {
            throw new common_1.NotFoundException('Certificate not found');
        }
        return certificate;
    }
    async generatePdf(certificateId) {
        const certificate = await this.getCertificateById(certificateId);
        const [siteName, siteUrl] = await Promise.all([
            this.settingsService.get('site_name').then((s) => s?.value || 'Tiny LMS'),
            this.settingsService.get('site_url').then((s) => s?.value || ''),
        ]);
        const verifyUrl = certificate.certificateNumber && siteUrl
            ? `${siteUrl}/verify/${certificate.certificateNumber}`
            : null;
        const qrBuffer = verifyUrl ? await QRCode.toBuffer(verifyUrl, { width: 80 }) : null;
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({
                size: 'A4',
                layout: 'landscape',
                margins: { top: 50, bottom: 50, left: 50, right: 50 },
            });
            const chunks = [];
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
            const width = doc.page.width;
            const height = doc.page.height;
            doc.rect(0, 0, width, 70).fill('#1e40af');
            doc.fillColor('#ffffff').fontSize(20).font('Helvetica-Bold').text(siteName, 0, 22, { align: 'center', width });
            doc.rect(20, 80, width - 40, height - 100).stroke('#D4AF37');
            doc.fillColor('#D4AF37').fontSize(14).font('Helvetica-Bold').text('CERTIFICATE OF COMPLETION', 0, 105, { align: 'center' });
            doc.moveTo(width / 2 - 150, 130).lineTo(width / 2 + 150, 130).stroke('#D4AF37');
            doc.fillColor('#333333').fontSize(12).font('Helvetica').text('This is to certify that', 0, 150, { align: 'center' });
            doc.fillColor('#000000').fontSize(28).font('Helvetica-Bold').text(certificate.user.fullName || 'Student', 0, 178, { align: 'center' });
            doc.moveTo(width / 2 - 100, 218).lineTo(width / 2 + 100, 218).stroke('#666666');
            const completionLabel = certificate.course ? 'has successfully completed the course' : 'has successfully completed the learning path';
            doc.fillColor('#333333').fontSize(12).font('Helvetica').text(completionLabel, 0, 232, { align: 'center' });
            const completionTitle = certificate.course?.title ?? certificate.learningPath?.title ?? 'Unknown';
            doc.fillColor('#000000').fontSize(22).font('Helvetica-Bold').text(completionTitle, 0, 258, { align: 'center' });
            const issuedDate = new Date(certificate.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            doc.fillColor('#666666').fontSize(11).font('Helvetica').text(`Issued on ${issuedDate}`, 0, 305, { align: 'center' });
            if (certificate.certificateNumber) {
                doc.fontSize(9).fillColor('#999999').text(`Certificate No: ${certificate.certificateNumber}`, 0, 325, { align: 'center' });
            }
            const instructorName = certificate.course?.instructor?.fullName || 'Instructor';
            doc.moveTo(100, height - 80).lineTo(250, height - 80).stroke('#333333');
            doc.fontSize(10).fillColor('#333333').text(instructorName, 100, height - 70, { align: 'center', width: 150 });
            doc.fontSize(8).text('Course Instructor', 100, height - 58, { align: 'center', width: 150 });
            if (qrBuffer) {
                doc.image(qrBuffer, width - 115, height - 110, { width: 80 });
                doc.fontSize(7).fillColor('#999999').text('Verify certificate', width - 115, height - 27, { width: 80, align: 'center' });
            }
            doc.end();
        });
    }
    async generateCertNumber() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        for (let attempt = 0; attempt < 5; attempt++) {
            const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            const rand = Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
            const certNumber = `CERT-${date}-${rand}`;
            const existing = await this.prisma.certificate.findUnique({ where: { certificateNumber: certNumber } });
            if (!existing)
                return certNumber;
        }
        throw new Error('Failed to generate unique certificate number');
    }
    async handleLessonCompleted(payload) {
        try {
            const existing = await this.prisma.certificate.findUnique({
                where: { userId_courseId: { userId: payload.userId, courseId: payload.courseId } },
            });
            if (existing)
                return;
            const isEligible = await this.checkCompletionEligibility(payload.userId, payload.courseId);
            if (isEligible) {
                await this.issueCertificate(payload.userId, payload.courseId);
            }
        }
        catch {
        }
    }
    async issuePathCertificate(userId, pathId) {
        const existing = await this.prisma.certificate.findUnique({
            where: { userId_learningPathId: { userId, learningPathId: pathId } },
        });
        if (existing)
            return existing;
        const certificateNumber = await this.generateCertNumber();
        return this.prisma.certificate.create({
            data: { userId, learningPathId: pathId, certificateNumber },
        });
    }
    async findByNumber(certificateNumber) {
        const cert = await this.prisma.certificate.findUnique({
            where: { certificateNumber },
            include: {
                course: { select: { title: true, slug: true } },
                learningPath: { select: { title: true, slug: true } },
                user: { select: { fullName: true } },
            },
        });
        if (!cert)
            throw new common_1.NotFoundException('Certificate not found');
        return {
            certificateNumber: cert.certificateNumber,
            issuedAt: cert.issuedAt,
            course: cert.course ?? null,
            learningPath: cert.learningPath ?? null,
            title: cert.course?.title ?? cert.learningPath?.title ?? 'Unknown',
            holderName: cert.user.fullName,
        };
    }
    async isEligibleForCertificate(userId, courseId) {
        const enrollment = await this.prisma.enrollment.findUnique({
            where: {
                userId_courseId: { userId, courseId },
            },
        });
        if (!enrollment) {
            return { eligible: false, reason: 'Not enrolled' };
        }
        const existingCert = await this.prisma.certificate.findUnique({
            where: {
                userId_courseId: { userId, courseId },
            },
        });
        if (existingCert) {
            return { eligible: true, reason: 'Certificate already issued' };
        }
        const isEligible = await this.checkCompletionEligibility(userId, courseId);
        if (!isEligible) {
            return { eligible: false, reason: 'Course not completed yet' };
        }
        return { eligible: true };
    }
};
exports.CertificatesService = CertificatesService;
__decorate([
    (0, event_emitter_1.OnEvent)('lesson.completed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CertificatesService.prototype, "handleLessonCompleted", null);
exports.CertificatesService = CertificatesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        supabase_service_1.SupabaseService,
        event_emitter_1.EventEmitter2,
        settings_service_1.SettingsService])
], CertificatesService);
//# sourceMappingURL=certificates.service.js.map