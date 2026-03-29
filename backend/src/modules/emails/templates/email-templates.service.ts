import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';

export interface EmailTemplateDto {
  slug: string;
  name: string;
  subject: string;
  body: string;
  isActive?: boolean;
}

@Injectable()
export class EmailTemplatesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.emailTemplate.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findBySlug(slug: string) {
    const template = await this.prisma.emailTemplate.findUnique({
      where: { slug },
    });
    if (!template) {
      throw new NotFoundException(`Email template '${slug}' not found`);
    }
    return template;
  }

  async create(data: EmailTemplateDto) {
    return this.prisma.emailTemplate.create({
      data: {
        slug: data.slug,
        name: data.name,
        subject: data.subject,
        body: data.body,
        isActive: data.isActive ?? true,
      },
    });
  }

  async update(slug: string, data: Partial<EmailTemplateDto>) {
    await this.findBySlug(slug); // Verify exists
    return this.prisma.emailTemplate.update({
      where: { slug },
      data: {
        name: data.name,
        subject: data.subject,
        body: data.body,
        isActive: data.isActive,
      },
    });
  }

  async delete(slug: string) {
    await this.findBySlug(slug);
    await this.prisma.emailTemplate.delete({ where: { slug } });
    return { success: true };
  }

  // Render template with variables
  render(template: { subject: string; body: string }, variables: Record<string, string>): { subject: string; body: string } {
    let subject = template.subject;
    let body = template.body;

    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      subject = subject.replace(new RegExp(placeholder, 'g'), value);
      body = body.replace(new RegExp(placeholder, 'g'), value);
    }

    return { subject, body };
  }

  // Seed default templates
  async seedDefaults() {
    const defaults: EmailTemplateDto[] = [
      {
        slug: 'welcome',
        name: 'Welcome Email',
        subject: 'Welcome to {{site_name}}!',
        body: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #3b82f6;">Welcome to {{site_name}}!</h1>
  </div>
  <p>Hello {{user_name}},</p>
  <p>Welcome to {{site_name}}! We're excited to have you on board.</p>
  <p>With your account, you can:</p>
  <ul>
    <li>Browse and enroll in courses</li>
    <li>Take quizzes and track your progress</li>
    <li>Earn certificates upon completion</li>
  </ul>
  <div style="margin-top: 30px; text-align: center;">
    <a href="{{site_url}}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Get Started</a>
  </div>
  <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
    If you have any questions, feel free to reply to this email.
  </p>
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
  <p style="color: #9ca3af; font-size: 12px; text-align: center;">
    {{footer_text}}
  </p>
</body>
</html>
        `.trim(),
      },
      {
        slug: 'enrollment',
        name: 'Course Enrollment',
        subject: 'You have been enrolled in {{course_name}}',
        body: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #10b981;">Enrollment Confirmed!</h1>
  </div>
  <p>Hello {{user_name}},</p>
  <p>Great news! You have been enrolled in <strong>{{course_name}}</strong>.</p>
  <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="margin-top: 0;">Course Details</h3>
    <p><strong>Instructor:</strong> {{instructor_name}}</p>
    <p><strong>Duration:</strong> {{course_duration}}</p>
  </div>
  <div style="margin-top: 30px; text-align: center;">
    <a href="{{course_url}}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Start Learning</a>
  </div>
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
  <p style="color: #9ca3af; font-size: 12px; text-align: center;">
    {{footer_text}}
  </p>
</body>
</html>
        `.trim(),
      },
      {
        slug: 'certificate',
        name: 'Certificate Issued',
        subject: 'Congratulations! Your certificate for {{course_name}}',
        body: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <div style="font-size: 60px; margin-bottom: 20px;">🎉</div>
    <h1 style="color: #f59e0b;">Congratulations!</h1>
  </div>
  <p>Hello {{user_name}},</p>
  <p>Congratulations on completing <strong>{{course_name}}</strong>!</p>
  <p>Your certificate is ready. You can download it from your dashboard.</p>
  <div style="margin-top: 30px; text-align: center;">
    <a href="{{certificate_url}}" style="background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Certificate</a>
  </div>
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
  <p style="color: #9ca3af; font-size: 12px; text-align: center;">
    {{footer_text}}
  </p>
</body>
</html>
        `.trim(),
      },
      {
        slug: 'quiz_result',
        name: 'Quiz Result',
        subject: 'Your quiz result: {{quiz_name}}',
        body: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #3b82f6;">Quiz Result</h1>
  </div>
  <p>Hello {{user_name}},</p>
  <p>Here are your results for <strong>{{quiz_name}}</strong>:</p>
  <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
    <p style="font-size: 24px; font-weight: bold; margin: 0;">{{score}}%</p>
    <p style="color: #6b7280; margin: 5px 0 0 0;">{{result}}</p>
  </div>
  <p>Total time: {{time_spent}}</p>
  <div style="margin-top: 30px; text-align: center;">
    <a href="{{quiz_url}}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Details</a>
  </div>
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
  <p style="color: #9ca3af; font-size: 12px; text-align: center;">
    {{footer_text}}
  </p>
</body>
</html>
        `.trim(),
      },
    ];

    for (const template of defaults) {
      await this.prisma.emailTemplate.upsert({
        where: { slug: template.slug },
        create: template,
        update: {}, // Keep existing if already exists
      });
    }

    return { seeded: defaults.length };
  }
}
