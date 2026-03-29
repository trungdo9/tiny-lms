import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../common/prisma.service';
import { SupabaseService } from '../../common/supabase.service';
import { SettingsService } from '../settings/settings.service';
import { CONTACT_SYNC_EVENTS } from '../contact-sync/contact-sync.events';
import * as PDFDocument from 'pdfkit';
import * as QRCode from 'qrcode';

@Injectable()
export class CertificatesService {
  constructor(
    private prisma: PrismaService,
    private supabase: SupabaseService,
    private eventEmitter: EventEmitter2,
    private settingsService: SettingsService,
  ) {}

  async issueCertificate(userId: string, courseId: string) {
    // Check if user is enrolled
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId },
      },
    });

    if (!enrollment) {
      throw new BadRequestException('User is not enrolled in this course');
    }

    // Check if certificate already exists
    const existingCert = await this.prisma.certificate.findUnique({
      where: {
        userId_courseId: { userId, courseId },
      },
    });

    if (existingCert) {
      return existingCert;
    }

    // Check completion criteria
    const isEligible = await this.checkCompletionEligibility(userId, courseId);
    if (!isEligible) {
      throw new BadRequestException('Course not completed yet');
    }

    // Create certificate with unique number
    const certificateNumber = await this.generateCertNumber();
    const certificate = await this.prisma.certificate.create({
      data: {
        userId,
        courseId,
        certificateNumber,
      },
    });

    this.eventEmitter.emit(CONTACT_SYNC_EVENTS.COURSE_COMPLETED, { userId, courseId });

    return certificate;
  }

  async checkCompletionEligibility(userId: string, courseId: string): Promise<boolean> {
    // Get course with lessons and quizzes
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

    // Collect all lesson IDs
    const lessonIds: string[] = [];
    for (const section of course.sections) {
      for (const lesson of section.lessons) {
        lessonIds.push(lesson.id);
      }
    }

    // Check 1: 100% lessons completed
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

    // Check 2: Pass any quiz with passScore
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

  async getMyCertificates(userId: string) {
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

  async getCertificateById(certificateId: string) {
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
      throw new NotFoundException('Certificate not found');
    }

    return certificate;
  }

  async generatePdf(certificateId: string): Promise<Buffer> {
    const certificate = await this.getCertificateById(certificateId);

    const [siteName, siteUrl] = await Promise.all([
      this.settingsService.get('site_name').then((s: any) => s?.value || 'Tiny LMS'),
      this.settingsService.get('site_url').then((s: any) => s?.value || ''),
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

      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const width = doc.page.width;
      const height = doc.page.height;

      // Header band
      doc.rect(0, 0, width, 70).fill('#1e40af');
      doc.fillColor('#ffffff').fontSize(20).font('Helvetica-Bold').text(siteName, 0, 22, { align: 'center', width });

      // Outer border
      doc.rect(20, 80, width - 40, height - 100).stroke('#D4AF37');

      // Title
      doc.fillColor('#D4AF37').fontSize(14).font('Helvetica-Bold').text('CERTIFICATE OF COMPLETION', 0, 105, { align: 'center' });
      doc.moveTo(width / 2 - 150, 130).lineTo(width / 2 + 150, 130).stroke('#D4AF37');

      // Body
      doc.fillColor('#333333').fontSize(12).font('Helvetica').text('This is to certify that', 0, 150, { align: 'center' });
      doc.fillColor('#000000').fontSize(28).font('Helvetica-Bold').text(certificate.user.fullName || 'Student', 0, 178, { align: 'center' });
      doc.moveTo(width / 2 - 100, 218).lineTo(width / 2 + 100, 218).stroke('#666666');
      const completionLabel = certificate.course ? 'has successfully completed the course' : 'has successfully completed the learning path';
      doc.fillColor('#333333').fontSize(12).font('Helvetica').text(completionLabel, 0, 232, { align: 'center' });
      const completionTitle = certificate.course?.title ?? certificate.learningPath?.title ?? 'Unknown';
      doc.fillColor('#000000').fontSize(22).font('Helvetica-Bold').text(completionTitle, 0, 258, { align: 'center' });

      const issuedDate = new Date(certificate.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      doc.fillColor('#666666').fontSize(11).font('Helvetica').text(`Issued on ${issuedDate}`, 0, 305, { align: 'center' });

      // Certificate number
      if (certificate.certificateNumber) {
        doc.fontSize(9).fillColor('#999999').text(`Certificate No: ${certificate.certificateNumber}`, 0, 325, { align: 'center' });
      }

      // Instructor signature
      const instructorName = certificate.course?.instructor?.fullName || 'Instructor';
      doc.moveTo(100, height - 80).lineTo(250, height - 80).stroke('#333333');
      doc.fontSize(10).fillColor('#333333').text(instructorName, 100, height - 70, { align: 'center', width: 150 });
      doc.fontSize(8).text('Course Instructor', 100, height - 58, { align: 'center', width: 150 });

      // QR code bottom-right
      if (qrBuffer) {
        doc.image(qrBuffer, width - 115, height - 110, { width: 80 });
        doc.fontSize(7).fillColor('#999999').text('Verify certificate', width - 115, height - 27, { width: 80, align: 'center' });
      }

      doc.end();
    });
  }

  private async generateCertNumber(): Promise<string> {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    for (let attempt = 0; attempt < 5; attempt++) {
      const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const rand = Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
      const certNumber = `CERT-${date}-${rand}`;
      const existing = await this.prisma.certificate.findUnique({ where: { certificateNumber: certNumber } });
      if (!existing) return certNumber;
    }
    throw new Error('Failed to generate unique certificate number');
  }

  @OnEvent('lesson.completed')
  async handleLessonCompleted(payload: { userId: string; courseId: string }) {
    try {
      const existing = await this.prisma.certificate.findUnique({
        where: { userId_courseId: { userId: payload.userId, courseId: payload.courseId } },
      });
      if (existing) return;

      const isEligible = await this.checkCompletionEligibility(payload.userId, payload.courseId);
      if (isEligible) {
        await this.issueCertificate(payload.userId, payload.courseId);
      }
    } catch {
      // Don't break lesson completion if cert issuance fails
    }
  }

  async issuePathCertificate(userId: string, pathId: string) {
    const existing = await this.prisma.certificate.findUnique({
      where: { userId_learningPathId: { userId, learningPathId: pathId } },
    });
    if (existing) return existing;

    const certificateNumber = await this.generateCertNumber();
    return this.prisma.certificate.create({
      data: { userId, learningPathId: pathId, certificateNumber },
    });
  }

  async findByNumber(certificateNumber: string) {
    const cert = await this.prisma.certificate.findUnique({
      where: { certificateNumber },
      include: {
        course: { select: { title: true, slug: true } },
        learningPath: { select: { title: true, slug: true } },
        user: { select: { fullName: true } },
      },
    });
    if (!cert) throw new NotFoundException('Certificate not found');
    return {
      certificateNumber: cert.certificateNumber,
      issuedAt: cert.issuedAt,
      course: cert.course ?? null,
      learningPath: cert.learningPath ?? null,
      title: cert.course?.title ?? cert.learningPath?.title ?? 'Unknown',
      holderName: cert.user.fullName,
    };
  }

  async isEligibleForCertificate(userId: string, courseId: string): Promise<{ eligible: boolean; reason?: string }> {
    // Check enrollment
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId },
      },
    });

    if (!enrollment) {
      return { eligible: false, reason: 'Not enrolled' };
    }

    // Check if already has certificate
    const existingCert = await this.prisma.certificate.findUnique({
      where: {
        userId_courseId: { userId, courseId },
      },
    });

    if (existingCert) {
      return { eligible: true, reason: 'Certificate already issued' };
    }

    // Check eligibility
    const isEligible = await this.checkCompletionEligibility(userId, courseId);
    if (!isEligible) {
      return { eligible: false, reason: 'Course not completed yet' };
    }

    return { eligible: true };
  }
}
