import { PrismaService } from '../../common/prisma.service';
export declare class ScormService {
    private prisma;
    private readonly scormBaseDir;
    constructor(prisma: PrismaService);
    uploadPackage(file: Express.Multer.File, target: {
        lessonId?: string;
        courseId?: string;
    }): Promise<{
        id: string;
        version: string;
        title: string;
        entryPoint: string;
        fileSize: number | null;
    }>;
    private parseManifest;
    getPackageByLesson(lessonId: string): Promise<{
        id: string;
        title: string;
        version: string;
        entryPoint: string;
        fileSize: number | null;
    }>;
    getPackageByCourse(courseId: string): Promise<{
        id: string;
        title: string;
        version: string;
        entryPoint: string;
        fileSize: number | null;
    }>;
    initAttempt(userId: string, packageId: string, lessonId?: string, courseId?: string): Promise<{
        attemptId: string;
        cmiData: Record<string, string>;
        version: string;
        entryPoint: string;
        packageId: string;
    }>;
    updateAttempt(attemptId: string, values: Record<string, string>, userId: string): Promise<{
        id: string;
        updatedAt: Date;
        courseId: string | null;
        lessonId: string | null;
        userId: string;
        isCompleted: boolean;
        startedAt: Date;
        lessonStatus: string;
        scoreRaw: number | null;
        scoreMax: number | null;
        scoreMin: number | null;
        suspendData: string | null;
        location: string | null;
        sessionTime: string | null;
        exitStatus: string | null;
        completionStatus: string | null;
        successStatus: string | null;
        scaledScore: number | null;
        packageId: string;
        totalTime: string | null;
    }>;
    finishAttempt(attemptId: string, userId: string): Promise<{
        id: string;
        updatedAt: Date;
        courseId: string | null;
        lessonId: string | null;
        userId: string;
        isCompleted: boolean;
        startedAt: Date;
        lessonStatus: string;
        scoreRaw: number | null;
        scoreMax: number | null;
        scoreMin: number | null;
        suspendData: string | null;
        location: string | null;
        sessionTime: string | null;
        exitStatus: string | null;
        completionStatus: string | null;
        successStatus: string | null;
        scaledScore: number | null;
        packageId: string;
        totalTime: string | null;
    }>;
    private validateSuspendData;
}
