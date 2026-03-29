import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting seed...');

  // Clean up existing data
  await prisma.quizAnswer.deleteMany();
  await prisma.attemptQuestion.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.quizQuestion.deleteMany();
  await prisma.questionOption.deleteMany();
  await prisma.question.deleteMany();
  await prisma.questionBank.deleteMany();
  await prisma.flashCardSession.deleteMany();
  await prisma.flashCard.deleteMany();
  await prisma.flashCardDeck.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.lessonProgress.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.section.deleteMany();
  await prisma.course.deleteMany();
  await prisma.category.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.emailTemplate.deleteMany();
  await prisma.emailLog.deleteMany();

  console.log('Cleaned existing data...');

  // Create Categories - sequential to handle parent relationships
  const progCategory = await prisma.category.create({
    data: { name: 'Programming', slug: 'programming' },
  });
  const categories = await Promise.all([
    prisma.category.create({
      data: { name: 'Web Development', slug: 'web-development', parentId: progCategory.id },
    }),
    prisma.category.create({
      data: { name: 'Mobile Development', slug: 'mobile-development', parentId: progCategory.id },
    }),
    prisma.category.create({
      data: { name: 'Data Science', slug: 'data-science' },
    }),
    prisma.category.create({
      data: { name: 'Design', slug: 'design' },
    }),
  ]);
  // Add parent to beginning
  categories.unshift(progCategory);
  console.log('Created categories');

  // Create Instructor Profile
  const instructor = await prisma.profile.create({
    data: {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'instructor@example.com',
      fullName: 'John Instructor',
      role: 'instructor',
      bio: 'Experienced developer and instructor with 10+ years in the industry.',
      isActive: true,
      emailVerified: true,
    },
  });
  console.log('Created instructor');

  // Create Student Profiles
  const students = await Promise.all([
    prisma.profile.create({
      data: {
        id: '00000000-0000-0000-0000-000000000101',
        email: 'student1@example.com',
        fullName: 'Alice Student',
        role: 'student',
        isActive: true,
        emailVerified: true,
      },
    }),
    prisma.profile.create({
      data: {
        id: '00000000-0000-0000-0000-000000000102',
        email: 'student2@example.com',
        fullName: 'Bob Learner',
        role: 'student',
        isActive: true,
        emailVerified: true,
      },
    }),
    prisma.profile.create({
      data: {
        id: '00000000-0000-0000-0000-000000000103',
        email: 'student3@example.com',
        fullName: 'Charlie Brown',
        role: 'student',
        isActive: true,
        emailVerified: true,
      },
    }),
  ]);
  console.log('Created students');

  // Create Course 1: Web Development Fundamentals
  const course1 = await prisma.course.create({
    data: {
      instructorId: instructor.id,
      categoryId: categories[1].id, // Web Development
      title: 'Web Development Fundamentals',
      slug: 'web-development-fundamentals',
      description: 'Learn the basics of web development including HTML, CSS, and JavaScript.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800',
      level: 'beginner',
      status: 'published',
      isFree: true,
    },
  });
  console.log('Created course 1');

  // Create Course 2: Advanced React
  const course2 = await prisma.course.create({
    data: {
      instructorId: instructor.id,
      categoryId: categories[1].id, // Web Development
      title: 'Advanced React Patterns',
      slug: 'advanced-react-patterns',
      description: 'Master advanced React patterns, hooks, and performance optimization.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
      level: 'advanced',
      status: 'published',
      isFree: false,
      price: 49.99,
    },
  });
  console.log('Created course 2');

  // Create Course 3: Python for Data Science
  const course3 = await prisma.course.create({
    data: {
      instructorId: instructor.id,
      categoryId: categories[3].id, // Data Science
      title: 'Python for Data Science',
      slug: 'python-data-science',
      description: 'Learn Python programming and data analysis with pandas and numpy.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800',
      level: 'intermediate',
      status: 'published',
      isFree: false,
      price: 79.99,
    },
  });
  console.log('Created course 3');

  // ==================== COURSE 1: Web Development Fundamentals ====================
  // Sections
  const c1Sections = await Promise.all([
    prisma.section.create({
      data: { courseId: course1.id, title: 'Introduction to HTML', orderIndex: 0 },
    }),
    prisma.section.create({
      data: { courseId: course1.id, title: 'CSS Basics', orderIndex: 1 },
    }),
    prisma.section.create({
      data: { courseId: course1.id, title: 'JavaScript Fundamentals', orderIndex: 2 },
    }),
  ]);
  console.log('Created course 1 sections');

  // Lessons - Section 1: HTML
  const c1s1Lessons = await Promise.all([
    prisma.lesson.create({
      data: {
        sectionId: c1Sections[0].id,
        courseId: course1.id,
        title: 'What is HTML?',
        type: 'video',
        content: '# What is HTML?\n\nHTML (HyperText Markup Language) is the standard markup language for creating web pages.',
        videoUrl: 'https://www.youtube.com/watch?v=UB1O30fR-EE',
        videoProvider: 'youtube',
        durationMins: 15,
        orderIndex: 0,
        isPublished: true,
      },
    }),
    prisma.lesson.create({
      data: {
        sectionId: c1Sections[0].id,
        courseId: course1.id,
        title: 'HTML Elements and Tags',
        type: 'video',
        content: 'Learn about HTML elements and tags.',
        videoUrl: 'https://www.youtube.com/watch?v=ewZ_YWbIWXI',
        videoProvider: 'youtube',
        durationMins: 20,
        orderIndex: 1,
        isPublished: true,
      },
    }),
    prisma.lesson.create({
      data: {
        sectionId: c1Sections[0].id,
        courseId: course1.id,
        title: 'HTML Practice Quiz',
        type: 'quiz',
        content: 'Test your HTML knowledge!',
        durationMins: 10,
        orderIndex: 2,
        isPublished: true,
      },
    }),
  ]);
  console.log('Created course 1 section 1 lessons');

  // Lessons - Section 2: CSS
  const c1s2Lessons = await Promise.all([
    prisma.lesson.create({
      data: {
        sectionId: c1Sections[1].id,
        courseId: course1.id,
        title: 'Introduction to CSS',
        type: 'video',
        content: '# Introduction to CSS\n\nCSS (Cascading Style Sheets) is used to style and layout web pages.',
        videoUrl: 'https://www.youtube.com/watch?v=yfoY53QXEnI',
        videoProvider: 'youtube',
        durationMins: 18,
        orderIndex: 0,
        isPublished: true,
      },
    }),
    prisma.lesson.create({
      data: {
        sectionId: c1Sections[1].id,
        courseId: course1.id,
        title: 'CSS Flexbox Tutorial',
        type: 'video',
        content: 'Learn CSS Flexbox for responsive layouts.',
        videoUrl: 'https://www.youtube.com/watch?v=FTlczfR82mQ',
        videoProvider: 'youtube',
        durationMins: 25,
        orderIndex: 1,
        isPublished: true,
      },
    }),
    prisma.lesson.create({
      data: {
        sectionId: c1Sections[1].id,
        courseId: course1.id,
        title: 'CSS Flash Cards',
        type: 'flashcard',
        content: 'Learn CSS properties with flashcards.',
        durationMins: 15,
        orderIndex: 2,
        isPublished: true,
      },
    }),
  ]);
  console.log('Created course 1 section 2 lessons');

  // Lessons - Section 3: JavaScript
  const c1s3Lessons = await Promise.all([
    prisma.lesson.create({
      data: {
        sectionId: c1Sections[2].id,
        courseId: course1.id,
        title: 'JavaScript Basics',
        type: 'video',
        content: '# JavaScript Basics\n\nLearn the fundamentals of JavaScript programming.',
        videoUrl: 'https://www.youtube.com/watch?v=W6NZfCO5SIk',
        videoProvider: 'youtube',
        durationMins: 30,
        orderIndex: 0,
        isPublished: true,
      },
    }),
    prisma.lesson.create({
      data: {
        sectionId: c1Sections[2].id,
        courseId: course1.id,
        title: 'JavaScript Functions',
        type: 'video',
        content: 'Understanding JavaScript functions.',
        videoUrl: 'https://www.youtube.com/watch?v=FOD408a0EzU',
        videoProvider: 'youtube',
        durationMins: 22,
        orderIndex: 1,
        isPublished: true,
      },
    }),
    prisma.lesson.create({
      data: {
        sectionId: c1Sections[2].id,
        courseId: course1.id,
        title: 'JavaScript Quiz',
        type: 'quiz',
        content: 'Test your JavaScript knowledge!',
        durationMins: 15,
        orderIndex: 2,
        isPublished: true,
      },
    }),
  ]);
  console.log('Created course 1 section 3 lessons');

  // ==================== Create Activities for Course 1 ====================
  // HTML Quiz Activity
  const htmlActivity = await prisma.activity.create({
    data: {
      lessonId: c1s1Lessons[2].id,
      activityType: 'quiz',
      title: 'HTML Practice Quiz',
      isPublished: true,
    },
  });

  const htmlQuiz = await prisma.quiz.create({
    data: {
      activityId: htmlActivity.id,
      courseId: course1.id,
      sectionId: c1Sections[0].id,
      title: 'HTML Practice Quiz',
      description: 'Test your knowledge of HTML',
      timeLimitMinutes: 10,
      maxAttempts: 3,
      passScore: 70,
      isPublished: true,
    },
  });

  // CSS Flashcard Activity
  const cssFlashActivity = await prisma.activity.create({
    data: {
      lessonId: c1s2Lessons[2].id,
      activityType: 'flashcard',
      title: 'CSS Properties Flash Cards',
      isPublished: true,
    },
  });

  const cssFlashDeck = await prisma.flashCardDeck.create({
    data: {
      activityId: cssFlashActivity.id,
      title: 'CSS Properties Flash Cards',
      description: 'Learn common CSS properties',
      shuffleCards: true,
      isPublished: true,
    },
  });

  // JS Quiz Activity
  const jsActivity = await prisma.activity.create({
    data: {
      lessonId: c1s3Lessons[2].id,
      activityType: 'quiz',
      title: 'JavaScript Quiz',
      isPublished: true,
    },
  });

  const jsQuiz = await prisma.quiz.create({
    data: {
      activityId: jsActivity.id,
      courseId: course1.id,
      sectionId: c1Sections[2].id,
      title: 'JavaScript Quiz',
      description: 'Test your JavaScript knowledge',
      timeLimitMinutes: 15,
      maxAttempts: 3,
      passScore: 70,
      isPublished: true,
    },
  });

  // Add some video/file activities
  const videoActivity1 = await prisma.activity.create({
    data: {
      lessonId: c1s1Lessons[0].id,
      activityType: 'video',
      title: 'HTML Video Resources',
      contentUrl: 'https://www.youtube.com/playlist?list=PL4cUxeGkcC9ivVk_t4pRp0Aqaqx2-Je13',
      contentType: 'youtube',
      isPublished: true,
    },
  });

  const fileActivity1 = await prisma.activity.create({
    data: {
      lessonId: c1s1Lessons[1].id,
      activityType: 'file',
      title: 'HTML Cheat Sheet',
      contentUrl: '/files/html-cheatsheet.pdf',
      contentType: 'pdf',
      isPublished: true,
    },
  });
  console.log('Created activities for course 1');

  // ==================== Create Questions for HTML Quiz ====================
  const htmlQuestionBank = await prisma.questionBank.create({
    data: {
      title: 'HTML Basics',
      description: 'Basic HTML questions',
      courseId: course1.id,
      createdBy: instructor.id,
    },
  });

  const htmlQuestions = await Promise.all([
    prisma.question.create({
      data: {
        bankId: htmlQuestionBank.id,
        type: 'single',
        content: 'What does HTML stand for?',
        explanation: 'HTML stands for HyperText Markup Language.',
        difficulty: 'easy',
        defaultScore: 1,
        options: {
          create: [
            { content: 'Hyper Text Markup Language', isCorrect: true },
            { content: 'High Tech Modern Language', isCorrect: false },
            { content: 'Hyper Transfer Markup Language', isCorrect: false },
            { content: 'Home Tool Markup Language', isCorrect: false },
          ],
        },
      },
    }),
    prisma.question.create({
      data: {
        bankId: htmlQuestionBank.id,
        type: 'single',
        content: 'Which tag is used for the largest heading in HTML?',
        explanation: 'The <h1> tag defines the most important heading.',
        difficulty: 'easy',
        defaultScore: 1,
        options: {
          create: [
            { content: '<heading>' },
            { content: '<h6>' },
            { content: '<h1>', isCorrect: true },
            { content: '<head>' },
          ],
        },
      },
    }),
    prisma.question.create({
      data: {
        bankId: htmlQuestionBank.id,
        type: 'single',
        content: 'Which HTML attribute specifies an alternate text for an image?',
        explanation: 'The alt attribute provides alternative text for an image.',
        difficulty: 'easy',
        defaultScore: 1,
        options: {
          create: [
            { content: 'title' },
            { content: 'src' },
            { content: 'alt', isCorrect: true },
            { content: 'longdesc' },
          ],
        },
      },
    }),
    prisma.question.create({
      data: {
        bankId: htmlQuestionBank.id,
        type: 'single',
        content: 'Which HTML element is used to define a hyperlink?',
        explanation: 'The <a> tag defines a hyperlink.',
        difficulty: 'easy',
        defaultScore: 1,
        options: {
          create: [
            { content: '<link>' },
            { content: '<a>', isCorrect: true },
            { content: '<href>' },
            { content: '<url>' },
          ],
        },
      },
    }),
    prisma.question.create({
      data: {
        bankId: htmlQuestionBank.id,
        type: 'multi',
        content: 'Which of the following are valid HTML5 semantic elements? (Select all that apply)',
        explanation: 'Semantic elements clearly describe their meaning: header, nav, article, section, footer.',
        difficulty: 'medium',
        defaultScore: 2,
        options: {
          create: [
            { content: '<header>', isCorrect: true },
            { content: '<div>', isCorrect: false },
            { content: '<article>', isCorrect: true },
            { content: '<span>', isCorrect: false },
          ],
        },
      },
    }),
  ]);

  // Add questions to quiz
  for (let i = 0; i < htmlQuestions.length; i++) {
    await prisma.quizQuestion.create({
      data: {
        quizId: htmlQuiz.id,
        questionId: htmlQuestions[i].id,
        orderIndex: i,
      },
    });
  }
  console.log('Created HTML quiz questions');

  // ==================== Create Questions for JS Quiz ====================
  const jsQuestionBank = await prisma.questionBank.create({
    data: {
      title: 'JavaScript Basics',
      description: 'Basic JavaScript questions',
      courseId: course1.id,
      createdBy: instructor.id,
    },
  });

  const jsQuestions = await Promise.all([
    prisma.question.create({
      data: {
        bankId: jsQuestionBank.id,
        type: 'single',
        content: 'Which keyword is used to declare a constant in JavaScript?',
        explanation: 'The const keyword is used to declare constants in JavaScript.',
        difficulty: 'easy',
        defaultScore: 1,
        options: {
          create: [
            { content: 'var' },
            { content: 'let' },
            { content: 'const', isCorrect: true },
            { content: 'constant' },
          ],
        },
      },
    }),
    prisma.question.create({
      data: {
        bankId: jsQuestionBank.id,
        type: 'single',
        content: 'What will typeof null return in JavaScript?',
        explanation: 'Due to a historical bug, typeof null returns "object".',
        difficulty: 'medium',
        defaultScore: 1,
        options: {
          create: [
            { content: 'null' },
            { content: 'undefined' },
            { content: 'object', isCorrect: true },
            { content: 'boolean' },
          ],
        },
      },
    }),
    prisma.question.create({
      data: {
        bankId: jsQuestionBank.id,
        type: 'single',
        content: 'Which method is used to add an element at the end of an array?',
        explanation: 'The push() method adds elements to the end of an array.',
        difficulty: 'easy',
        defaultScore: 1,
        options: {
          create: [
            { content: 'add()' },
            { content: 'append()' },
            { content: 'push()', isCorrect: true },
            { content: 'insert()' },
          ],
        },
      },
    }),
    prisma.question.create({
      data: {
        bankId: jsQuestionBank.id,
        type: 'true_false',
        content: 'JavaScript is a statically typed language.',
        explanation: 'JavaScript is dynamically typed, meaning variable types can change at runtime.',
        difficulty: 'easy',
        defaultScore: 1,
        options: {
          create: [
            { content: 'True' },
            { content: 'False', isCorrect: true },
          ],
        },
      },
    }),
    prisma.question.create({
      data: {
        bankId: jsQuestionBank.id,
        type: 'single',
        content: 'What is the correct way to create a function in JavaScript?',
        explanation: 'All are valid ways to create functions in JavaScript, but function declaration is most common.',
        difficulty: 'easy',
        defaultScore: 1,
        options: {
          create: [
            { content: 'function = myFunction()' },
            { content: 'function myFunction()', isCorrect: true },
            { content: 'def myFunction()' },
            { content: 'create myFunction()' },
          ],
        },
      },
    }),
  ]);

  for (let i = 0; i < jsQuestions.length; i++) {
    await prisma.quizQuestion.create({
      data: {
        quizId: jsQuiz.id,
        questionId: jsQuestions[i].id,
        orderIndex: i,
      },
    });
  }
  console.log('Created JS quiz questions');

  // ==================== Create Flash Cards for CSS ====================
  const cssCards = [
    { front: 'display: flex', back: 'Enables flexbox layout for container' },
    { front: 'display: grid', back: 'Enables CSS Grid layout' },
    { front: 'position: absolute', back: 'Positions element relative to nearest positioned ancestor' },
    { front: 'position: fixed', back: 'Positions element relative to viewport' },
    { front: 'z-index', back: 'Controls stacking order of elements' },
    { front: 'box-sizing: border-box', back: 'Includes padding and border in element width/height' },
    { front: 'margin', back: 'Space outside the border' },
    { front: 'padding', back: 'Space inside the border' },
    { front: '@media query', back: 'Applies styles based on device characteristics' },
    { front: 'display: none', back: 'Hides element completely' },
  ];

  for (let i = 0; i < cssCards.length; i++) {
    await prisma.flashCard.create({
      data: {
        deckId: cssFlashDeck.id,
        front: cssCards[i].front,
        back: cssCards[i].back,
        orderIndex: i,
      },
    });
  }
  console.log('Created CSS flash cards');

  // ==================== Create Enrollments ====================
  await Promise.all([
    prisma.enrollment.create({
      data: { userId: students[0].id, courseId: course1.id },
    }),
    prisma.enrollment.create({
      data: { userId: students[1].id, courseId: course1.id },
    }),
    prisma.enrollment.create({
      data: { userId: students[2].id, courseId: course1.id },
    }),
    prisma.enrollment.create({
      data: { userId: students[0].id, courseId: course2.id },
    }),
    prisma.enrollment.create({
      data: { userId: students[1].id, courseId: course3.id },
    }),
  ]);
  console.log('Created enrollments');

  // ==================== Create Lesson Progress ====================
  await Promise.all([
    prisma.lessonProgress.create({
      data: {
        userId: students[0].id,
        lessonId: c1s1Lessons[0].id,
        courseId: course1.id,
        isCompleted: true,
        completedAt: new Date(),
      },
    }),
    prisma.lessonProgress.create({
      data: {
        userId: students[0].id,
        lessonId: c1s1Lessons[1].id,
        courseId: course1.id,
        isCompleted: true,
        completedAt: new Date(),
      },
    }),
    prisma.lessonProgress.create({
      data: {
        userId: students[1].id,
        lessonId: c1s1Lessons[0].id,
        courseId: course1.id,
        isCompleted: true,
        completedAt: new Date(),
      },
    }),
  ]);
  console.log('Created lesson progress');

  // ==================== Create Sample Quiz Attempts ====================
  const quizAttempt = await prisma.quizAttempt.create({
    data: {
      quizId: htmlQuiz.id,
      userId: students[0].id,
      attemptNumber: 1,
      status: 'submitted',
      startedAt: new Date(Date.now() - 3600000),
      submittedAt: new Date(Date.now() - 3000000),
      timeSpentSecs: 600,
      totalScore: 4,
      maxScore: 5,
      percentage: 80,
      isPassed: true,
    },
  });

  // Add attempt questions
  for (let i = 0; i < htmlQuestions.length; i++) {
    const attemptQuestion = await prisma.attemptQuestion.create({
      data: {
        attemptId: quizAttempt.id,
        questionId: htmlQuestions[i].id,
        orderIndex: i,
        optionsOrder: [],
        score: i < 4 ? 1 : 0,
      },
    });

    // Add answer
    await prisma.quizAnswer.create({
      data: {
        attemptId: quizAttempt.id,
        attemptQuestionId: attemptQuestion.id,
        questionId: htmlQuestions[i].id,
        selectedOptions: i === 0 ? ['Hyper Text Markup Language'] : [],
        isCorrect: i < 4,
        scoreEarned: i < 4 ? 1 : 0,
      },
    });
  }
  console.log('Created quiz attempts');

  // ==================== Create Settings ====================
  await Promise.all([
    prisma.setting.create({ data: { key: 'site_name', value: 'Tiny LMS', category: 'general' } }),
    prisma.setting.create({ data: { key: 'site_description', value: 'Online Learning Platform', category: 'general' } }),
    prisma.setting.create({ data: { key: 'currency', value: 'USD', category: 'payment' } }),
    prisma.setting.create({ data: { key: 'email_from', value: 'noreply@example.com', category: 'email' } }),
  ]);
  console.log('Created settings');

  // ==================== Create Email Templates ====================
  await Promise.all([
    prisma.emailTemplate.create({
      data: {
        slug: 'welcome',
        name: 'Welcome Email',
        subject: 'Welcome to {{site_name}}!',
        body: '<h1>Welcome {{full_name}}!</h1><p>Thank you for joining {{site_name}}.</p>',
        isActive: true,
      },
    }),
    prisma.emailTemplate.create({
      data: {
        slug: 'enrollment',
        name: 'Enrollment Confirmation',
        subject: 'You have been enrolled in {{course_name}}',
        body: '<h1>Enrollment Confirmed!</h1><p>You have been enrolled in {{course_name}}.</p>',
        isActive: true,
      },
    }),
  ]);
  console.log('Created email templates');

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
