/**
 * Landing Page Content Data
 * Centralized content for hero, value props, features, etc.
 * Phase 1: Hero + Value Proposition
 * Phase 2: Features + How-It-Works
 */

export const HERO_CONTENT = {
  badge: 'LMS v1.0 • Learn Today',
  headline: 'Interactive Learning Platform - Create Courses in Minutes',
  subheadline:
    'Build interactive learning experiences with quizzes, flashcards, and real-time analytics. Perfect for instructors, educators, and corporate training.',
  primaryCta: {
    text: 'Get Started Free',
    href: '/register',
  },
  secondaryCta: {
    text: 'Explore Courses',
    href: '/courses',
  },
  stats: [
    { number: '10K+', label: 'Learners' },
    { number: '500+', label: 'Courses' },
    { number: '95%', label: 'Completion Rate' },
  ],
} as const;

export const VALUE_PROPS = [
  {
    id: 'quick-setup',
    icon: 'Zap',
    title: 'Quick Setup',
    description: 'Create your first course in minutes with our intuitive builder. No coding required.',
  },
  {
    id: 'engagement',
    icon: 'Sparkles',
    title: 'Student Engagement',
    description: 'Interactive quizzes, flashcards, and gamification keep learners motivated and focused.',
  },
  {
    id: 'analytics',
    icon: 'BarChart3',
    title: 'Real-time Analytics',
    description: 'Track student progress, identify struggles, and adapt teaching in real-time with detailed insights.',
  },
  {
    id: 'mobile-first',
    icon: 'Smartphone',
    title: 'Mobile Learning',
    description: 'Learn anywhere, anytime. Fully responsive design works seamlessly on all devices.',
  },
  {
    id: 'secure',
    icon: 'Lock',
    title: 'Secure & Reliable',
    description: 'Enterprise-grade security, SOC2 compliant, and 99.9% uptime guarantee.',
  },
] as const;

export const FEATURES = [
  {
    id: 'quizzes',
    icon: 'ClipboardList',
    title: 'Interactive Quizzes',
    description: 'Test knowledge with multiple question types. Instant feedback keeps learners on track.',
    learnMoreHref: '#',
  },
  {
    id: 'flashcards',
    icon: 'Layers',
    title: 'Flashcard Decks',
    description: 'Spaced repetition learning for efficient retention and long-term memory building.',
    learnMoreHref: '#',
  },
  {
    id: 'progress',
    icon: 'BarChart3',
    title: 'Progress Tracking',
    description: 'Monitor student engagement with detailed analytics and performance heatmaps.',
    learnMoreHref: '#',
  },
  {
    id: 'certificates',
    icon: 'Trophy',
    title: 'Digital Certificates',
    description: 'Award certificates upon completion. Shareable credentials build student confidence.',
    learnMoreHref: '#',
  },
  {
    id: 'video',
    icon: 'Video',
    title: 'Video Lessons',
    description: 'Embed videos directly in lessons. Supports YouTube, Vimeo, and direct uploads.',
    learnMoreHref: '#',
  },
  {
    id: 'collaboration',
    icon: 'Users',
    title: 'Collaboration Tools',
    description: 'Discussion forums and group activities enable peer learning and community building.',
    learnMoreHref: '#',
  },
  {
    id: 'messaging',
    icon: 'MessageSquare',
    title: 'Direct Messaging',
    description: 'One-on-one communication between students and instructors for personalized support.',
    learnMoreHref: '#',
  },
  {
    id: 'analytics',
    icon: 'BarChart4',
    title: 'Advanced Analytics',
    description: 'Deep insights into course performance, engagement patterns, and learner behavior.',
    learnMoreHref: '#',
  },
] as const;

export const HOW_IT_WORKS = {
  instructor: [
    {
      step: 1,
      icon: 'BookOpen',
      title: 'Create Your Course',
      description: '5-minute setup with our intuitive course builder. Add title, description, and structure.',
      imageUrl: undefined,
    },
    {
      step: 2,
      icon: 'FileText',
      title: 'Add Content & Quizzes',
      description: 'Build lessons, upload videos, create interactive quizzes and flashcards with drag-drop ease.',
      imageUrl: undefined,
    },
    {
      step: 3,
      icon: 'Users',
      title: 'Publish & Manage',
      description: 'Publish to students, track progress in real-time, adjust content based on analytics.',
      imageUrl: undefined,
    },
  ],
  student: [
    {
      step: 1,
      icon: 'Heart',
      title: 'Enroll in a Course',
      description: 'Browse public courses and enroll to start learning immediately from day one.',
      imageUrl: undefined,
    },
    {
      step: 2,
      icon: 'Zap',
      title: 'Learn at Your Pace',
      description: 'Complete lessons, take quizzes, review flashcards anytime, anywhere on any device.',
      imageUrl: undefined,
    },
    {
      step: 3,
      icon: 'Award',
      title: 'Earn Your Certificate',
      description: 'Complete course requirements and earn a digital certificate to showcase your achievement.',
      imageUrl: undefined,
    },
  ],
} as const;

export const STATS = [
  { number: '10K+', label: 'Learners', icon: 'Users' },
  { number: '500+', label: 'Courses', icon: 'BookOpen' },
  { number: '95%', label: 'Completion Rate', icon: 'TrendingUp' },
  { number: '4.8★', label: 'Average Rating', icon: 'Star' },
] as const;

export const TESTIMONIALS = [
  {
    id: 'testimonial-1',
    name: 'Sarah Chen',
    title: 'Instructor',
    company: 'Tech Academy',
    photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    quote: 'Tiny LMS transformed how I teach online. My students are more engaged than ever, and the analytics help me identify who needs extra support.',
    videoUrl: undefined,
  },
  {
    id: 'testimonial-2',
    name: 'Marcus Johnson',
    title: 'Student',
    company: 'University of Tech',
    photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
    quote: 'The flashcards and quizzes make learning fun. I actually look forward to studying now instead of dreading it.',
    videoUrl: undefined,
  },
  {
    id: 'testimonial-3',
    name: 'Emma Rodriguez',
    title: 'Corporate Trainer',
    company: 'Fortune 500 Company',
    photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    quote: 'We saved 40% on training costs and improved employee engagement significantly. Best investment we made this year.',
    videoUrl: undefined,
  },
  {
    id: 'testimonial-4',
    name: 'David Park',
    title: 'Department Head',
    company: 'Community College',
    photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    quote: 'Setting up our courses took minutes, not weeks. The support team is responsive and genuinely cares about our success.',
    videoUrl: undefined,
  },
  {
    id: 'testimonial-5',
    name: 'Lisa Thompson',
    title: 'Student',
    company: 'Self-Taught Developer',
    photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
    quote: 'I completed three courses while working full-time. Mobile access made it possible to learn anytime, anywhere.',
    videoUrl: undefined,
  },
] as const;

export const USE_CASES = [
  {
    id: 'use-case-1',
    icon: 'Briefcase',
    title: 'Corporate Skills Training',
    description: 'Transform how your organization upskills employees with interactive online training that drives engagement and retention.',
    metrics: [
      { label: 'Time Saved', value: '40%' },
      { label: 'Engagement', value: '95%' },
    ],
    cta: { text: 'Learn more', href: '#' },
  },
  {
    id: 'use-case-2',
    icon: 'GraduationCap',
    title: 'University Online Courses',
    description: 'Expand your reach and offer high-quality online education that adapts to student learning styles and paces.',
    metrics: [
      { label: 'Completion Rate', value: '92%' },
      { label: 'Student Satisfaction', value: '4.8/5' },
    ],
    cta: { text: 'Learn more', href: '#' },
  },
  {
    id: 'use-case-3',
    icon: 'Users',
    title: 'Community Learning',
    description: 'Build engaged learning communities with peer-to-peer support, discussion forums, and collaborative activities.',
    metrics: [
      { label: 'Active Members', value: '10K+' },
      { label: 'Monthly Courses', value: '500+' },
    ],
    cta: { text: 'Learn more', href: '#' },
  },
] as const;

export const FAQ_ITEMS = [
  {
    id: 'faq-1',
    category: 'general',
    question: 'What is Tiny LMS and who is it for?',
    answer: 'Tiny LMS is a comprehensive learning management system designed for educators, corporate trainers, and anyone creating online courses. It works for instructors, students, and organizations of all sizes.',
  },
  {
    id: 'faq-2',
    category: 'general',
    question: 'Is Tiny LMS secure and compliant?',
    answer: 'Yes, Tiny LMS is SOC2 Type II certified and GDPR compliant. We use enterprise-grade encryption and maintain 99.9% uptime with automatic backups.',
  },
  {
    id: 'faq-3',
    category: 'instructor',
    question: 'How long does it take to create a course?',
    answer: 'You can create and publish a basic course in as little as 5 minutes. Add content, quizzes, and flashcards using our intuitive drag-and-drop builder.',
  },
  {
    id: 'faq-4',
    category: 'instructor',
    question: 'Can I track student progress and engagement?',
    answer: 'Absolutely. Our real-time analytics dashboard shows you engagement heatmaps, quiz performance, completion rates, and identifies at-risk students.',
  },
  {
    id: 'faq-5',
    category: 'instructor',
    question: 'What content types can I add to my courses?',
    answer: 'You can add videos, documents, interactive quizzes, flashcard decks, discussion forums, assignments, and more. We support all major file formats.',
  },
  {
    id: 'faq-6',
    category: 'student',
    question: 'Can I access courses on mobile?',
    answer: 'Yes! Tiny LMS is fully responsive and works seamlessly on iOS and Android devices. Learn offline and sync when you reconnect.',
  },
  {
    id: 'faq-7',
    category: 'student',
    question: 'What happens when I complete a course?',
    answer: 'You earn a digital certificate that you can download, share on LinkedIn, and include on your resume. Some courses also offer official credentials.',
  },
  {
    id: 'faq-8',
    category: 'student',
    question: 'Can I learn at my own pace?',
    answer: 'Completely. Most courses are self-paced, allowing you to learn whenever and wherever you want. Some instructors may set deadlines.',
  },
  {
    id: 'faq-9',
    category: 'general',
    question: 'How much does Tiny LMS cost?',
    answer: 'We offer a free plan for individuals with limited features, and affordable paid plans for instructors and organizations. Pricing starts at $9/month.',
  },
  {
    id: 'faq-10',
    category: 'general',
    question: 'What support do you offer?',
    answer: 'We provide email support (24/7), live chat during business hours, comprehensive documentation, video tutorials, and a community forum.',
  },
  {
    id: 'faq-11',
    category: 'general',
    question: 'Can I integrate Tiny LMS with other tools?',
    answer: 'Yes, we support integrations with Zapier, Slack, Google Classroom, and custom API integrations. Contact our team for your specific needs.',
  },
  {
    id: 'faq-12',
    category: 'instructor',
    question: 'Is there a limit on how many students I can have?',
    answer: 'No limits! From 1 student to 1 million, Tiny LMS scales seamlessly. We automatically optimize performance based on your needs.',
  },
] as const;

export type HeroContent = typeof HERO_CONTENT;
export type ValueProp = (typeof VALUE_PROPS)[number];
export type Feature = (typeof FEATURES)[number];
export type HowItWorksStep = (typeof HOW_IT_WORKS.instructor)[number];
export type HowItWorksFlow = typeof HOW_IT_WORKS;
export type Stat = (typeof STATS)[number];
export type Testimonial = (typeof TESTIMONIALS)[number];
export type UseCase = (typeof USE_CASES)[number];
export type FAQItem = (typeof FAQ_ITEMS)[number];
