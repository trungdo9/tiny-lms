import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import AdmZip = require('adm-zip');
import * as xml2js from 'xml2js';
import * as path from 'path';
import * as fs from 'fs';
import { randomUUID } from 'crypto';

const CMI_MAP: Record<string, string> = {
  // SCORM 1.2
  'cmi.core.lesson_status': 'lessonStatus',
  'cmi.core.score.raw': 'scoreRaw',
  'cmi.core.score.max': 'scoreMax',
  'cmi.core.score.min': 'scoreMin',
  'cmi.suspend_data': 'suspendData',
  'cmi.core.lesson_location': 'location',
  'cmi.core.session_time': 'sessionTime',
  'cmi.core.exit': 'exitStatus',
  // SCORM 2004
  'cmi.completion_status': 'completionStatus',
  'cmi.success_status': 'successStatus',
  'cmi.score.raw': 'scoreRaw',
  'cmi.score.max': 'scoreMax',
  'cmi.score.min': 'scoreMin',
  'cmi.score.scaled': 'scaledScore',
  'cmi.location': 'location',
  'cmi.session_time': 'sessionTime',
  'cmi.exit': 'exitStatus',
};

const NUMERIC_FIELDS = new Set([
  'scoreRaw',
  'scoreMax',
  'scoreMin',
  'scaledScore',
]);

@Injectable()
export class ScormService {
  private readonly scormBaseDir: string;

  constructor(private prisma: PrismaService) {
    this.scormBaseDir = path.join(process.cwd(), 'public', 'scorm');
    if (!fs.existsSync(this.scormBaseDir)) {
      fs.mkdirSync(this.scormBaseDir, { recursive: true });
    }
  }

  async uploadPackage(
    file: Express.Multer.File,
    target: { lessonId?: string; courseId?: string },
  ) {
    if (!file || !file.buffer) {
      throw new BadRequestException('No file uploaded');
    }

    const mime = file.mimetype;
    if (
      mime !== 'application/zip' &&
      mime !== 'application/x-zip-compressed' &&
      mime !== 'application/octet-stream'
    ) {
      throw new BadRequestException('File must be a ZIP archive');
    }

    const packageId = randomUUID();
    const extractDir = path.join(this.scormBaseDir, packageId);

    try {
      const zip = new AdmZip(file.buffer);
      const entries = zip.getEntries();

      // Security: check for path traversal
      for (const entry of entries) {
        if (entry.entryName.includes('..')) {
          throw new BadRequestException(
            'ZIP contains invalid path entries',
          );
        }
      }

      fs.mkdirSync(extractDir, { recursive: true });
      zip.extractAllTo(extractDir, true);

      // Validate extracted path
      const resolvedDir = fs.realpathSync(extractDir);
      if (!resolvedDir.startsWith(fs.realpathSync(this.scormBaseDir))) {
        throw new BadRequestException('Path traversal detected');
      }

      // Parse imsmanifest.xml
      const manifestPath = path.join(extractDir, 'imsmanifest.xml');
      if (!fs.existsSync(manifestPath)) {
        // Try to find it in a subdirectory
        const subdirs = fs
          .readdirSync(extractDir, { withFileTypes: true })
          .filter((d) => d.isDirectory());
        let found = false;
        for (const dir of subdirs) {
          const subManifest = path.join(
            extractDir,
            dir.name,
            'imsmanifest.xml',
          );
          if (fs.existsSync(subManifest)) {
            found = true;
            break;
          }
        }
        if (!found) {
          throw new BadRequestException(
            'ZIP does not contain imsmanifest.xml',
          );
        }
      }

      const manifestXml = fs.readFileSync(manifestPath, 'utf-8');
      const parsed = await this.parseManifest(manifestXml);

      // Delete existing package for this lesson/course if re-uploading
      if (target.lessonId) {
        await this.prisma.scormPackage.deleteMany({
          where: { lessonId: target.lessonId },
        });
      }
      if (target.courseId) {
        await this.prisma.scormPackage.deleteMany({
          where: { courseId: target.courseId },
        });
      }

      const pkg = await this.prisma.scormPackage.create({
        data: {
          id: packageId,
          lessonId: target.lessonId || null,
          courseId: target.courseId || null,
          version: parsed.version,
          title: parsed.title,
          entryPoint: parsed.entryPoint,
          extractedPath: extractDir,
          fileSize: file.size,
          manifestData: parsed.manifestData as any,
        },
      });

      return {
        id: pkg.id,
        version: pkg.version,
        title: pkg.title,
        entryPoint: pkg.entryPoint,
        fileSize: pkg.fileSize,
      };
    } catch (error) {
      // Cleanup on failure
      if (fs.existsSync(extractDir)) {
        fs.rmSync(extractDir, { recursive: true, force: true });
      }
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(
        `Failed to process SCORM package: ${error.message}`,
      );
    }
  }

  private async parseManifest(xmlString: string): Promise<{
    version: string;
    entryPoint: string;
    title: string;
    manifestData: Record<string, any>;
  }> {
    const result = await xml2js.parseStringPromise(xmlString, {
      explicitArray: false,
      ignoreAttrs: false,
      tagNameProcessors: [xml2js.processors.stripPrefix],
    });

    const manifest = result.manifest || result;

    // Detect version
    let version = '1.2';
    const metadata = manifest.metadata;
    if (metadata) {
      const schemaVersion =
        metadata.schemaversion || metadata.schemaVersion;
      if (
        schemaVersion &&
        (schemaVersion.includes('2004') || schemaVersion.includes('CAM'))
      ) {
        version = '2004';
      }
    }

    // Extract title
    const organizations = manifest.organizations;
    let title = 'SCORM Package';
    if (organizations) {
      const org = organizations.organization;
      if (org) {
        const orgObj = Array.isArray(org) ? org[0] : org;
        title = orgObj.title || title;
      }
    }

    // Extract entry point from first resource with SCO type or first resource
    let entryPoint = 'index.html';
    const resources = manifest.resources;
    if (resources) {
      const resource = resources.resource;
      const resourceList = Array.isArray(resource) ? resource : [resource];
      for (const res of resourceList) {
        if (res && res.$ && res.$.href) {
          entryPoint = res.$.href;
          break;
        }
      }
    }

    return {
      version,
      entryPoint,
      title,
      manifestData: { schemaVersion: version },
    };
  }

  async getPackageByLesson(lessonId: string) {
    const pkg = await this.prisma.scormPackage.findUnique({
      where: { lessonId },
      select: {
        id: true,
        version: true,
        title: true,
        entryPoint: true,
        fileSize: true,
      },
    });
    if (!pkg) throw new NotFoundException('SCORM package not found');
    return pkg;
  }

  async getPackageByCourse(courseId: string) {
    const pkg = await this.prisma.scormPackage.findUnique({
      where: { courseId },
      select: {
        id: true,
        version: true,
        title: true,
        entryPoint: true,
        fileSize: true,
      },
    });
    if (!pkg) throw new NotFoundException('SCORM package not found');
    return pkg;
  }

  async initAttempt(
    userId: string,
    packageId: string,
    lessonId?: string,
    courseId?: string,
  ) {
    const pkg = await this.prisma.scormPackage.findUnique({
      where: { id: packageId },
    });
    if (!pkg) throw new NotFoundException('SCORM package not found');

    const attempt = await this.prisma.scormAttempt.upsert({
      where: { userId_packageId: { userId, packageId } },
      create: {
        userId,
        packageId,
        lessonId: lessonId || pkg.lessonId,
        courseId: courseId || pkg.courseId,
      },
      update: {},
    });

    // Build CMI data from stored attempt state
    const cmiData: Record<string, string> = {};
    if (attempt.lessonStatus)
      cmiData['cmi.core.lesson_status'] = attempt.lessonStatus;
    if (attempt.suspendData)
      cmiData['cmi.suspend_data'] = attempt.suspendData;
    if (attempt.location)
      cmiData['cmi.core.lesson_location'] = attempt.location;
    if (attempt.scoreRaw != null)
      cmiData['cmi.core.score.raw'] = String(attempt.scoreRaw);
    if (attempt.scoreMax != null)
      cmiData['cmi.core.score.max'] = String(attempt.scoreMax);
    if (attempt.scoreMin != null)
      cmiData['cmi.core.score.min'] = String(attempt.scoreMin);
    if (attempt.totalTime) cmiData['cmi.core.total_time'] = attempt.totalTime;

    // SCORM 2004 equivalents
    if (pkg.version === '2004') {
      if (attempt.completionStatus)
        cmiData['cmi.completion_status'] = attempt.completionStatus;
      if (attempt.successStatus)
        cmiData['cmi.success_status'] = attempt.successStatus;
      if (attempt.scaledScore != null)
        cmiData['cmi.score.scaled'] = String(attempt.scaledScore);
      if (attempt.location) cmiData['cmi.location'] = attempt.location;
    }

    return {
      attemptId: attempt.id,
      cmiData,
      version: pkg.version,
      entryPoint: pkg.entryPoint,
      packageId: pkg.id,
    };
  }

  async updateAttempt(
    attemptId: string,
    values: Record<string, string>,
    userId: string,
  ) {
    const attempt = await this.prisma.scormAttempt.findUnique({
      where: { id: attemptId },
    });
    if (!attempt) throw new NotFoundException('Attempt not found');
    if (attempt.userId !== userId)
      throw new ForbiddenException('Not your attempt');

    const updateData: Record<string, any> = {};

    for (const [cmiKey, value] of Object.entries(values)) {
      const dbField = CMI_MAP[cmiKey];
      if (!dbField) continue;

      if (dbField === 'suspendData') {
        this.validateSuspendData(value, '1.2'); // lenient validation
      }

      if (NUMERIC_FIELDS.has(dbField)) {
        const num = parseFloat(value);
        if (!isNaN(num)) updateData[dbField] = num;
      } else {
        updateData[dbField] = value;
      }
    }

    if (Object.keys(updateData).length === 0) return attempt;

    return this.prisma.scormAttempt.update({
      where: { id: attemptId },
      data: updateData,
    });
  }

  async finishAttempt(attemptId: string, userId: string) {
    const attempt = await this.prisma.scormAttempt.findUnique({
      where: { id: attemptId },
      include: { package: true },
    });
    if (!attempt) throw new NotFoundException('Attempt not found');
    if (attempt.userId !== userId)
      throw new ForbiddenException('Not your attempt');

    // Determine completion
    const isCompleted =
      attempt.lessonStatus === 'passed' ||
      attempt.lessonStatus === 'completed' ||
      attempt.completionStatus === 'completed';

    const updated = await this.prisma.scormAttempt.update({
      where: { id: attemptId },
      data: { isCompleted },
    });

    // Sync LessonProgress if completed and has lessonId
    if (isCompleted && attempt.lessonId) {
      const lesson = await this.prisma.lesson.findUnique({
        where: { id: attempt.lessonId },
        select: { courseId: true },
      });
      if (lesson) {
        await this.prisma.lessonProgress.upsert({
          where: {
            userId_lessonId: { userId, lessonId: attempt.lessonId },
          },
          create: {
            userId,
            lessonId: attempt.lessonId,
            courseId: lesson.courseId,
            isCompleted: true,
            completedAt: new Date(),
          },
          update: {
            isCompleted: true,
            completedAt: new Date(),
          },
        });
      }
    }

    return updated;
  }

  private validateSuspendData(data: string, version: string) {
    const maxLength = version === '2004' ? 64000 : 4096;
    if (data.length > maxLength) {
      throw new BadRequestException(
        `suspend_data exceeds maximum length of ${maxLength} characters`,
      );
    }
  }
}
