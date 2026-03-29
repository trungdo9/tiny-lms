import { Injectable, NotFoundException, BadRequestException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { SupabaseService } from '../../common/supabase.service';
import { CreateCourseDto, UpdateCourseDto, CourseQueryDto, CloneCourseDto, CreateCategoryDto, UpdateCategoryDto } from './dto/course.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CoursesService {
  constructor(
    private prisma: PrismaService,
    private supabaseService: SupabaseService,
  ) { }

  private shouldUseSupabaseFallback(error: any) {
    return ['ENETUNREACH', 'P1001'].includes(error?.code) || /ENETUNREACH|Can't reach database server|connect ENETUNREACH/i.test(String(error?.message || ''));
  }

  private async getPublicCoursesFromSupabase(query: CourseQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let courseQuery = this.supabaseService.adminClient
      .from('courses')
      .select('id,title,slug,description,thumbnail_url,level,status,is_free,price,lesson_count,created_at,updated_at,instructor_id,category_id', { count: 'exact' })
      .eq('status', query.status || 'published')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (query.search) courseQuery = courseQuery.ilike('title', `%${query.search}%`);
    if (query.categoryId) courseQuery = courseQuery.eq('category_id', query.categoryId);
    if (query.level) courseQuery = courseQuery.eq('level', query.level);
    if (query.isFree !== undefined) courseQuery = courseQuery.eq('is_free', query.isFree);

    const { data: courses, error, count } = await courseQuery;
    if (error) throw error;

    const instructorIds = [...new Set((courses || []).map((course) => course.instructor_id).filter(Boolean))];
    const categoryIds = [...new Set((courses || []).map((course) => course.category_id).filter(Boolean))];

    const [{ data: instructors, error: instructorsError }, { data: categories, error: categoriesError }] = await Promise.all([
      instructorIds.length
        ? this.supabaseService.adminClient.from('profiles').select('id,full_name,avatar_url').in('id', instructorIds)
        : Promise.resolve({ data: [], error: null }),
      categoryIds.length
        ? this.supabaseService.adminClient.from('categories').select('id,name,slug').in('id', categoryIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (instructorsError) throw instructorsError;
    if (categoriesError) throw categoriesError;

    const instructorMap = new Map<string, any>((instructors || []).map((item: any) => [item.id, item] as [string, any]));
    const categoryMap = new Map<string, any>((categories || []).map((item: any) => [item.id, item] as [string, any]));

    return {
      data: (courses || []).map((course) => ({
        ...course,
        instructor: course.instructor_id ? instructorMap.get(course.instructor_id) || null : null,
        category: course.category_id ? categoryMap.get(course.category_id) || null : null,
        lessonCount: course.lesson_count || 0,
        sectionCount: 0,
        enrollmentCount: 0,
      })),
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  }

  private async getPublicCourseDetailFromSupabase(identifier: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(identifier);
    const courseQuery = this.supabaseService.adminClient
      .from('courses')
      .select('id,title,slug,description,thumbnail_url,level,status,is_free,price,lesson_count,created_at,updated_at,instructor_id,category_id')
      [isUuid ? 'eq' : 'ilike'](isUuid ? 'id' : 'slug', identifier)
      .limit(1)
      .maybeSingle();

    const { data: course, error } = await courseQuery;
    if (error) throw error;
    if (!course) throw new NotFoundException('Course not found');

    const [{ data: instructor, error: instructorError }, { data: category, error: categoryError }, { data: sections, error: sectionsError }, { data: lessons, error: lessonsError }] = await Promise.all([
      course.instructor_id
        ? this.supabaseService.adminClient.from('profiles').select('id,full_name,avatar_url').eq('id', course.instructor_id).maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      course.category_id
        ? this.supabaseService.adminClient.from('categories').select('id,name,slug').eq('id', course.category_id).maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      this.supabaseService.adminClient.from('sections').select('id,title,order_index,course_id').eq('course_id', course.id).order('order_index', { ascending: true }),
      this.supabaseService.adminClient.from('lessons').select('id,title,type,duration_mins,is_preview,is_published,order_index,section_id,course_id').eq('course_id', course.id).order('order_index', { ascending: true }),
    ]);

    if (instructorError) throw instructorError;
    if (categoryError) throw categoryError;
    if (sectionsError) throw sectionsError;
    if (lessonsError) throw lessonsError;

    const lessonsBySection = (lessons || []).reduce((acc: Record<string, any[]>, lesson: any) => {
      if (!lesson.section_id) return acc;
      acc[lesson.section_id] = acc[lesson.section_id] || [];
      acc[lesson.section_id].push(lesson);
      return acc;
    }, {});

    return {
      ...course,
      instructor,
      category,
      sections: (sections || []).map((section: any) => ({
        ...section,
        lessons: (lessonsBySection[section.id] || []).sort((a, b) => a.order_index - b.order_index),
      })),
    };
  }

  private async getPublicCategoriesFromSupabase() {
    const [{ data: categories, error: categoriesError }, { data: courses, error: coursesError }] = await Promise.all([
      this.supabaseService.adminClient.from('categories').select('id,name,slug,parent_id,created_at').order('name', { ascending: true }),
      this.supabaseService.adminClient.from('courses').select('category_id').not('category_id', 'is', null),
    ]);

    if (categoriesError) throw categoriesError;
    if (coursesError) throw coursesError;

    const courseCounts = (courses || []).reduce((acc: Record<string, number>, course: any) => {
      acc[course.category_id] = (acc[course.category_id] || 0) + 1;
      return acc;
    }, {});
    const categoryMap = new Map<string, any>((categories || []).map((item: any) => [item.id, item] as [string, any]));

    return (categories || []).map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      parentId: category.parent_id,
      createdAt: category.created_at,
      parent: category.parent_id ? categoryMap.get(category.parent_id) || null : null,
      _count: { courses: courseCounts[category.id] || 0 },
    }));
  }

  /** Returns true if userId can manage (edit/delete) the given course. Admin always passes. */
  async canManageCourse(courseId: string, userId: string, userRole: string): Promise<boolean> {
    if (userRole === 'admin') return true;
    const membership = await this.prisma.courseInstructor.findFirst({
      where: { courseId, profileId: userId },
    });
    return !!membership;
  }

  async create(dto: CreateCourseDto, instructorId: string) {
    const slug = this.generateSlug(dto.title);

    return this.prisma.$transaction(async (tx) => {
      const course = await tx.course.create({
        data: {
          title: dto.title,
          slug,
          description: dto.description,
          thumbnailUrl: dto.thumbnailUrl,
          level: dto.level || 'beginner',
          status: 'draft',
          isFree: dto.isFree || false,
          price: dto.price,
          instructorId,
          categoryId: dto.categoryId,
        },
      });

      // Sync primary instructor into join table
      await tx.courseInstructor.create({
        data: {
          courseId: course.id,
          profileId: instructorId,
          role: 'primary',
          addedBy: instructorId,
        },
      }).catch(() => { /* ignore if already exists */ });

      return course;
    });
  }

  async findAll(query: CourseQueryDto) {
    const where: Prisma.CourseWhereInput = {};

    // Filter by status, default to published
    where.status = query.status || 'published';

    if (query.search) {
      where.title = { contains: query.search, mode: 'insensitive' };
    }
    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }
    if (query.level) {
      where.level = query.level;
    }
    if (query.isFree !== undefined) {
      where.isFree = query.isFree;
    }

    const page = query.page || 1;
    const limit = query.limit || 10;

    try {
      const [courses, total] = await Promise.all([
        this.prisma.course.findMany({
          where,
          include: {
            instructor: { select: { id: true, fullName: true, avatarUrl: true } },
            category: { select: { id: true, name: true, slug: true } },
            _count: { select: { sections: true, lessons: true, enrollments: true } },
          },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        this.prisma.course.count({ where }),
      ]);

      return {
        data: courses.map((course) => ({
          ...course,
          lessonCount: course._count.lessons,
          sectionCount: course._count.sections,
          enrollmentCount: course._count.enrollments,
          _count: undefined,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      if (!this.shouldUseSupabaseFallback(error)) throw error;
      return this.getPublicCoursesFromSupabase(query);
    }
  }

  async findOne(idOrSlug: string) {
    try {
      const course = await this.prisma.course.findFirst({
        where: {
          OR: [{ id: idOrSlug }, { slug: idOrSlug }],
        },
        include: {
          instructor: { select: { id: true, fullName: true, avatarUrl: true } },
          category: { select: { id: true, name: true, slug: true } },
          sections: {
            include: {
              lessons: { orderBy: { orderIndex: 'asc' } },
            },
            orderBy: { orderIndex: 'asc' },
          },
        },
      });

      if (!course) {
        throw new NotFoundException('Course not found');
      }

      return course;
    } catch (error) {
      if (!this.shouldUseSupabaseFallback(error)) throw error;
      return this.getPublicCourseDetailFromSupabase(idOrSlug);
    }
  }

  async findMyCourses(userId: string) {
    return this.prisma.course.findMany({
      where: {
        enrollments: { some: { userId } },
      },
      include: {
        instructor: { select: { id: true, fullName: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findInstructorCourses(userId: string, userRole?: string, filters?: { search?: string; status?: string }) {
    let where: Prisma.CourseWhereInput = {};

    if (userRole !== 'admin') {
      const memberships = await this.prisma.courseInstructor.findMany({
        where: { profileId: userId },
        select: { courseId: true },
      });
      const courseIds = memberships.map((m) => m.courseId);
      if (courseIds.length === 0) return [];
      where = { id: { in: courseIds } };
    }

    if (filters?.search) {
      where.title = { contains: filters.search, mode: 'insensitive' };
    }
    if (filters?.status) {
      where.status = filters.status;
    }

    const courses = await this.prisma.course.findMany({
      where,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        _count: { select: { sections: true, enrollments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return courses.map((course) => ({
      ...course,
      sectionCount: course._count.sections,
      enrollmentCount: course._count.enrollments,
      _count: undefined,
    }));
  }

  async update(id: string, dto: UpdateCourseDto, userId: string, userRole: string = 'instructor') {
    if (!(await this.canManageCourse(id, userId, userRole))) {
      throw new ForbiddenException('You can only edit courses you are assigned to');
    }

    const data: Prisma.CourseUpdateInput = {};
    if (dto.title) {
      data.title = dto.title;
      data.slug = this.generateSlug(dto.title);
    }
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.thumbnailUrl !== undefined) data.thumbnailUrl = dto.thumbnailUrl;
    if (dto.level) data.level = dto.level;
    if (dto.status) data.status = dto.status;
    if (dto.isFree !== undefined) data.isFree = dto.isFree;
    if (dto.price !== undefined) data.price = dto.price;
    if (dto.categoryId !== undefined) {
      data.category = dto.categoryId
        ? { connect: { id: dto.categoryId } }
        : { disconnect: true };
    }

    return this.prisma.course.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, userId: string, userRole: string = 'instructor') {
    // Only primary instructor or admin can delete
    if (userRole !== 'admin') {
      const membership = await this.prisma.courseInstructor.findFirst({
        where: { courseId: id, profileId: userId, role: 'primary' },
      });
      if (!membership) {
        throw new ForbiddenException('Only the primary instructor or admin can delete a course');
      }
    }

    await this.prisma.course.delete({ where: { id } });
    return { success: true };
  }

  async getCategories() {
    try {
      return await this.prisma.category.findMany({
        orderBy: { name: 'asc' },
        include: {
          _count: { select: { courses: true } },
          parent: { select: { id: true, name: true, slug: true } },
        },
      });
    } catch (error) {
      if (!this.shouldUseSupabaseFallback(error)) throw error;
      return this.getPublicCategoriesFromSupabase();
    }
  }

  async getCategoryById(id: string) {
    const cat = await this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: { select: { courses: true } },
        parent: { select: { id: true, name: true } },
        children: { select: { id: true, name: true, slug: true } },
      },
    });
    if (!cat) throw new NotFoundException('Category not found');
    return cat;
  }

  async createCategory(name: string, slug?: string, parentId?: string) {
    const categorySlug = slug || this.generateSlug(name);
    try {
      return await this.prisma.category.create({
        data: {
          name,
          slug: categorySlug,
          ...(parentId && { parent: { connect: { id: parentId } } }),
        },
      });
    } catch (e: any) {
      if (e.code === 'P2002') throw new ConflictException('Slug already exists');
      throw e;
    }
  }

  async updateCategory(id: string, dto: UpdateCategoryDto) {
    await this.getCategoryById(id); // Throws 404 if not found
    const data: Prisma.CategoryUpdateInput = {};
    if (dto.name) {
      data.name = dto.name;
      if (!dto.slug) data.slug = this.generateSlug(dto.name);
    }
    if (dto.slug) data.slug = dto.slug;
    if (dto.parentId !== undefined) {
      data.parent = dto.parentId ? { connect: { id: dto.parentId } } : { disconnect: true };
    }
    try {
      return await this.prisma.category.update({ where: { id }, data });
    } catch (e: any) {
      if (e.code === 'P2002') throw new ConflictException('Slug already exists');
      throw e;
    }
  }

  async deleteCategory(id: string) {
    const cat = await this.prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { courses: true, children: true } } },
    });
    if (!cat) throw new NotFoundException('Category not found');
    if (cat._count.courses > 0)
      throw new BadRequestException(
        `Cannot delete: ${cat._count.courses} course(s) still assigned`,
      );
    if (cat._count.children > 0)
      throw new BadRequestException(`Cannot delete: has ${cat._count.children} sub-category(ies)`);
    await this.prisma.category.delete({ where: { id } });
    return { success: true };
  }

  async clone(courseId: string, userId: string, dto: CloneCourseDto, userRole: string = 'instructor') {
    if (!(await this.canManageCourse(courseId, userId, userRole))) {
      throw new ForbiddenException('You can only clone courses you are assigned to');
    }
    const source: any = await this.findOne(courseId);
    if (!source) throw new NotFoundException('Course not found');

    const newSlug = this.generateSlug(dto.title);

    return this.prisma.$transaction(async (tx) => {
      // Clone course metadata
      const newCourse = await tx.course.create({
        data: {
          title: dto.title,
          slug: newSlug,
          description: dto.description ?? source.description,
          thumbnailUrl: source.thumbnailUrl,
          level: source.level,
          status: 'draft',
          isFree: source.isFree,
          price: source.price,
          instructorId: userId,
          categoryId: source.categoryId,
        },
      });

      // Sync instructor
      await tx.courseInstructor.create({
        data: {
          courseId: newCourse.id,
          profileId: userId,
          role: 'primary',
          addedBy: userId,
        },
      }).catch(() => { });

      // Clone sections and lessons
      const lessonIdMap: Record<string, string> = {};
      const sectionIdMap: Record<string, string> = {};

      for (const section of source.sections) {
        const newSection = await tx.section.create({
          data: {
            courseId: newCourse.id,
            title: section.title,
            orderIndex: section.orderIndex,
          },
        });
        sectionIdMap[section.id] = newSection.id;

        for (const lesson of section.lessons) {
          const newLesson = await tx.lesson.create({
            data: {
              sectionId: newSection.id,
              courseId: newCourse.id,
              title: lesson.title,
              type: lesson.type,
              content: lesson.content,
              videoUrl: lesson.videoUrl,
              videoProvider: lesson.videoProvider,
              pdfUrl: lesson.pdfUrl,
              durationMins: lesson.durationMins,
              orderIndex: lesson.orderIndex,
              isPreview: lesson.isPreview,
              isPublished: false,
            },
          });
          lessonIdMap[lesson.id] = newLesson.id;
        }
      }

      // Handle quizzes based on importQuizMode
      if (dto.importQuizMode === 'clone_all') {
        await this.cloneAllQuizzes(tx, courseId, newCourse.id, sectionIdMap, lessonIdMap);
      } else if (dto.importQuizMode === 'import_from_quizzes' && dto.importFromQuizIds?.length) {
        await this.importQuestionsFromQuizzes(tx, dto.importFromQuizIds, newCourse.id, lessonIdMap);
      }

      return { ...newCourse, message: 'Course cloned successfully' };
    });
  }

  /** Clone all quizzes from source course into the new course (1:1 lesson mapping). */
  private async cloneAllQuizzes(
    tx: Prisma.TransactionClient,
    sourceCourseId: string,
    newCourseId: string,
    sectionIdMap: Record<string, string>,
    lessonIdMap: Record<string, string>,
  ) {
    const sourceQuizzes = await tx.quiz.findMany({
      where: { courseId: sourceCourseId },
      include: {
        questions: { orderBy: { orderIndex: 'asc' } },
        activity: true
      },
    });

    for (const quiz of sourceQuizzes) {
      if (!quiz.activity?.lessonId) continue;
      const newLessonId = lessonIdMap[quiz.activity.lessonId];
      const newSectionId = sectionIdMap[quiz.sectionId];
      if (!newLessonId || !newSectionId) continue;

      const { id: _id, courseId: _c, sectionId: _s, activityId: _a,
        createdAt: _ca, updatedAt: _ua, questions: _q, activity: _act, ...quizData } = quiz as any;

      const newActivity = await tx.activity.create({
        data: {
          lessonId: newLessonId,
          activityType: 'quiz',
          title: quizData.title,
          isPublished: false,
        }
      });

      await tx.quiz.create({
        data: {
          ...quizData,
          courseId: newCourseId,
          sectionId: newSectionId,
          activityId: newActivity.id,
          isPublished: false,
          questions: {
            create: quiz.questions.map((qq) => ({
              questionId: qq.questionId,
              bankId: qq.bankId,
              pickCount: qq.pickCount,
              difficultyFilter: qq.difficultyFilter,
              tagFilter: qq.tagFilter,
              orderIndex: qq.orderIndex,
              scoreOverride: qq.scoreOverride,
            })),
          },
        },
      });
    }
  }

  /**
   * Import questions from specific quizzes into the new course's lessons.
   * Creates one quiz in the first available lesson with all imported questions.
   */
  private async importQuestionsFromQuizzes(
    tx: Prisma.TransactionClient,
    sourceQuizIds: string[],
    newCourseId: string,
    lessonIdMap: Record<string, string>,
  ) {
    const sourceQuestions = await tx.quizQuestion.findMany({
      where: { quizId: { in: sourceQuizIds } },
      orderBy: { orderIndex: 'asc' },
    });

    if (!sourceQuestions.length) return;

    const newLessonIds = Object.values(lessonIdMap);
    const existingQuizLessons = await tx.activity.findMany({
      where: { lessonId: { in: newLessonIds }, activityType: 'quiz' },
      select: { lessonId: true },
    });
    const occupiedLessonIds = new Set(existingQuizLessons.map((q) => q.lessonId));
    const availableLessonIds = newLessonIds.filter((id) => !occupiedLessonIds.has(id));

    if (!availableLessonIds.length) return;

    const targetLesson = await tx.lesson.findUnique({
      where: { id: availableLessonIds[0] },
      include: { section: { select: { id: true } } },
    });
    if (!targetLesson) return;

    const newActivity = await tx.activity.create({
      data: {
        lessonId: availableLessonIds[0],
        activityType: 'quiz',
        title: 'Imported Quiz',
        isPublished: false,
      }
    });

    await tx.quiz.create({
      data: {
        title: 'Imported Quiz',
        courseId: newCourseId,
        sectionId: targetLesson.section.id,
        activityId: newActivity.id,
        isPublished: false,
        showResult: 'immediately',
        showCorrectAnswer: true,
        showExplanation: true,
        shuffleQuestions: false,
        shuffleAnswers: false,
        paginationMode: 'all',
        questionsPerPage: 1,
        allowBackNavigation: true,
        showLeaderboard: false,
        questions: {
          create: sourceQuestions.map((qq, index) => ({
            questionId: qq.questionId,
            bankId: qq.bankId,
            pickCount: qq.pickCount,
            difficultyFilter: qq.difficultyFilter,
            tagFilter: qq.tagFilter,
            orderIndex: index + 1,
            scoreOverride: qq.scoreOverride,
          })),
        },
      },
    });
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      + '-' + Date.now().toString(36);
  }
}
