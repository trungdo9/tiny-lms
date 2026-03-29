import { ScormService } from './scorm.service';
import { InitAttemptDto, UpdateAttemptDto } from './dto/scorm.dto';
export declare class ScormController {
    private readonly scormService;
    constructor(scormService: ScormService);
    uploadForLesson(lessonId: string, file: Express.Multer.File): Promise<{
        id: string;
        version: string;
        title: string;
        entryPoint: string;
        fileSize: number | null;
    }>;
    uploadForCourse(courseId: string, file: Express.Multer.File): Promise<{
        id: string;
        version: string;
        title: string;
        entryPoint: string;
        fileSize: number | null;
    }>;
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
    initAttempt(dto: InitAttemptDto, req: any): Promise<{
        attemptId: string;
        cmiData: Record<string, string>;
        version: string;
        entryPoint: string;
        packageId: string;
    }>;
    updateAttempt(id: string, dto: UpdateAttemptDto, req: any): Promise<{
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
    finishAttempt(id: string, req: any): Promise<{
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
}
