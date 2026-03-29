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
exports.ScormService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma.service");
const AdmZip = require("adm-zip");
const xml2js = __importStar(require("xml2js"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const crypto_1 = require("crypto");
const CMI_MAP = {
    'cmi.core.lesson_status': 'lessonStatus',
    'cmi.core.score.raw': 'scoreRaw',
    'cmi.core.score.max': 'scoreMax',
    'cmi.core.score.min': 'scoreMin',
    'cmi.suspend_data': 'suspendData',
    'cmi.core.lesson_location': 'location',
    'cmi.core.session_time': 'sessionTime',
    'cmi.core.exit': 'exitStatus',
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
let ScormService = class ScormService {
    prisma;
    scormBaseDir;
    constructor(prisma) {
        this.prisma = prisma;
        this.scormBaseDir = path.join(process.cwd(), 'public', 'scorm');
        if (!fs.existsSync(this.scormBaseDir)) {
            fs.mkdirSync(this.scormBaseDir, { recursive: true });
        }
    }
    async uploadPackage(file, target) {
        if (!file || !file.buffer) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        const mime = file.mimetype;
        if (mime !== 'application/zip' &&
            mime !== 'application/x-zip-compressed' &&
            mime !== 'application/octet-stream') {
            throw new common_1.BadRequestException('File must be a ZIP archive');
        }
        const packageId = (0, crypto_1.randomUUID)();
        const extractDir = path.join(this.scormBaseDir, packageId);
        try {
            const zip = new AdmZip(file.buffer);
            const entries = zip.getEntries();
            for (const entry of entries) {
                if (entry.entryName.includes('..')) {
                    throw new common_1.BadRequestException('ZIP contains invalid path entries');
                }
            }
            fs.mkdirSync(extractDir, { recursive: true });
            zip.extractAllTo(extractDir, true);
            const resolvedDir = fs.realpathSync(extractDir);
            if (!resolvedDir.startsWith(fs.realpathSync(this.scormBaseDir))) {
                throw new common_1.BadRequestException('Path traversal detected');
            }
            const manifestPath = path.join(extractDir, 'imsmanifest.xml');
            if (!fs.existsSync(manifestPath)) {
                const subdirs = fs
                    .readdirSync(extractDir, { withFileTypes: true })
                    .filter((d) => d.isDirectory());
                let found = false;
                for (const dir of subdirs) {
                    const subManifest = path.join(extractDir, dir.name, 'imsmanifest.xml');
                    if (fs.existsSync(subManifest)) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    throw new common_1.BadRequestException('ZIP does not contain imsmanifest.xml');
                }
            }
            const manifestXml = fs.readFileSync(manifestPath, 'utf-8');
            const parsed = await this.parseManifest(manifestXml);
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
                    manifestData: parsed.manifestData,
                },
            });
            return {
                id: pkg.id,
                version: pkg.version,
                title: pkg.title,
                entryPoint: pkg.entryPoint,
                fileSize: pkg.fileSize,
            };
        }
        catch (error) {
            if (fs.existsSync(extractDir)) {
                fs.rmSync(extractDir, { recursive: true, force: true });
            }
            if (error instanceof common_1.BadRequestException)
                throw error;
            throw new common_1.BadRequestException(`Failed to process SCORM package: ${error.message}`);
        }
    }
    async parseManifest(xmlString) {
        const result = await xml2js.parseStringPromise(xmlString, {
            explicitArray: false,
            ignoreAttrs: false,
            tagNameProcessors: [xml2js.processors.stripPrefix],
        });
        const manifest = result.manifest || result;
        let version = '1.2';
        const metadata = manifest.metadata;
        if (metadata) {
            const schemaVersion = metadata.schemaversion || metadata.schemaVersion;
            if (schemaVersion &&
                (schemaVersion.includes('2004') || schemaVersion.includes('CAM'))) {
                version = '2004';
            }
        }
        const organizations = manifest.organizations;
        let title = 'SCORM Package';
        if (organizations) {
            const org = organizations.organization;
            if (org) {
                const orgObj = Array.isArray(org) ? org[0] : org;
                title = orgObj.title || title;
            }
        }
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
    async getPackageByLesson(lessonId) {
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
        if (!pkg)
            throw new common_1.NotFoundException('SCORM package not found');
        return pkg;
    }
    async getPackageByCourse(courseId) {
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
        if (!pkg)
            throw new common_1.NotFoundException('SCORM package not found');
        return pkg;
    }
    async initAttempt(userId, packageId, lessonId, courseId) {
        const pkg = await this.prisma.scormPackage.findUnique({
            where: { id: packageId },
        });
        if (!pkg)
            throw new common_1.NotFoundException('SCORM package not found');
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
        const cmiData = {};
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
        if (attempt.totalTime)
            cmiData['cmi.core.total_time'] = attempt.totalTime;
        if (pkg.version === '2004') {
            if (attempt.completionStatus)
                cmiData['cmi.completion_status'] = attempt.completionStatus;
            if (attempt.successStatus)
                cmiData['cmi.success_status'] = attempt.successStatus;
            if (attempt.scaledScore != null)
                cmiData['cmi.score.scaled'] = String(attempt.scaledScore);
            if (attempt.location)
                cmiData['cmi.location'] = attempt.location;
        }
        return {
            attemptId: attempt.id,
            cmiData,
            version: pkg.version,
            entryPoint: pkg.entryPoint,
            packageId: pkg.id,
        };
    }
    async updateAttempt(attemptId, values, userId) {
        const attempt = await this.prisma.scormAttempt.findUnique({
            where: { id: attemptId },
        });
        if (!attempt)
            throw new common_1.NotFoundException('Attempt not found');
        if (attempt.userId !== userId)
            throw new common_1.ForbiddenException('Not your attempt');
        const updateData = {};
        for (const [cmiKey, value] of Object.entries(values)) {
            const dbField = CMI_MAP[cmiKey];
            if (!dbField)
                continue;
            if (dbField === 'suspendData') {
                this.validateSuspendData(value, '1.2');
            }
            if (NUMERIC_FIELDS.has(dbField)) {
                const num = parseFloat(value);
                if (!isNaN(num))
                    updateData[dbField] = num;
            }
            else {
                updateData[dbField] = value;
            }
        }
        if (Object.keys(updateData).length === 0)
            return attempt;
        return this.prisma.scormAttempt.update({
            where: { id: attemptId },
            data: updateData,
        });
    }
    async finishAttempt(attemptId, userId) {
        const attempt = await this.prisma.scormAttempt.findUnique({
            where: { id: attemptId },
            include: { package: true },
        });
        if (!attempt)
            throw new common_1.NotFoundException('Attempt not found');
        if (attempt.userId !== userId)
            throw new common_1.ForbiddenException('Not your attempt');
        const isCompleted = attempt.lessonStatus === 'passed' ||
            attempt.lessonStatus === 'completed' ||
            attempt.completionStatus === 'completed';
        const updated = await this.prisma.scormAttempt.update({
            where: { id: attemptId },
            data: { isCompleted },
        });
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
    validateSuspendData(data, version) {
        const maxLength = version === '2004' ? 64000 : 4096;
        if (data.length > maxLength) {
            throw new common_1.BadRequestException(`suspend_data exceeds maximum length of ${maxLength} characters`);
        }
    }
};
exports.ScormService = ScormService;
exports.ScormService = ScormService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ScormService);
//# sourceMappingURL=scorm.service.js.map