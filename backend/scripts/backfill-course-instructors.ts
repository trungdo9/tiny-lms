import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import { decorateDatabaseConnectionError, getDatabaseUrl } from '../src/common/database-url';

dotenv.config();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const connectionUrl = getDatabaseUrl();
const pool = new Pool({
  connectionString: connectionUrl,
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const inserted = await prisma.$executeRaw`
    INSERT INTO public.course_instructors (id, course_id, profile_id, role, added_at, added_by)
    SELECT gen_random_uuid(), id, instructor_id, 'primary', created_at, instructor_id
    FROM public.courses
    ON CONFLICT (course_id, profile_id) DO NOTHING
  `;
  console.log(`Backfill done. Rows affected: ${inserted}`);

  const total = await prisma.courseInstructor.count();
  console.log(`Total course_instructors rows: ${total}`);
}

main()
  .catch((e) => {
    console.error(decorateDatabaseConnectionError(e, connectionUrl));
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
