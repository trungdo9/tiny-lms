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
  console.log('=== Question Difficulty Normalization Backfill ===\n');

  // Audit before
  const beforeDistinct = await prisma.$queryRaw<{ difficulty: string; cnt: bigint }[]>`
    SELECT difficulty, COUNT(*)::int AS cnt FROM questions GROUP BY difficulty ORDER BY cnt DESC
  `;
  console.log('Before — questions.difficulty distribution:');
  beforeDistinct.forEach(r => console.log(`  ${JSON.stringify(r.difficulty)}: ${r.cnt}`));

  const beforeFilterDistinct = await prisma.$queryRaw<{ difficulty_filter: string | null; cnt: bigint }[]>`
    SELECT difficulty_filter, COUNT(*)::int AS cnt FROM quiz_questions GROUP BY difficulty_filter ORDER BY cnt DESC
  `;
  console.log('\nBefore — quiz_questions.difficulty_filter distribution:');
  beforeFilterDistinct.forEach(r => console.log(`  ${JSON.stringify(r.difficulty_filter)}: ${r.cnt}`));

  console.log('\n--- Running normalization ---\n');

  // Normalize questions.difficulty
  const easyQ = await prisma.$executeRaw`
    UPDATE questions SET difficulty = 'easy'
    WHERE LOWER(TRIM(difficulty)) IN ('easy', 'beginner', 'basic')
      AND difficulty != 'easy'
  `;
  console.log(`questions: mapped to 'easy': ${easyQ} rows`);

  const mediumQ = await prisma.$executeRaw`
    UPDATE questions SET difficulty = 'medium'
    WHERE LOWER(TRIM(difficulty)) IN ('medium', 'intermediate', 'normal', 'avg', 'average')
      AND difficulty != 'medium'
  `;
  console.log(`questions: mapped to 'medium': ${mediumQ} rows`);

  const hardQ = await prisma.$executeRaw`
    UPDATE questions SET difficulty = 'hard'
    WHERE LOWER(TRIM(difficulty)) IN ('hard', 'advanced', 'difficult')
      AND difficulty != 'hard'
  `;
  console.log(`questions: mapped to 'hard': ${hardQ} rows`);

  const fallbackQ = await prisma.$executeRaw`
    UPDATE questions SET difficulty = 'medium'
    WHERE difficulty IS NULL
       OR TRIM(difficulty) = ''
       OR LOWER(TRIM(difficulty)) NOT IN ('easy', 'medium', 'hard')
  `;
  console.log(`questions: fallback to 'medium' (unknown/null): ${fallbackQ} rows`);

  // Normalize quiz_questions.difficulty_filter
  const easyF = await prisma.$executeRaw`
    UPDATE quiz_questions SET difficulty_filter = 'easy'
    WHERE LOWER(TRIM(difficulty_filter)) IN ('easy', 'beginner', 'basic')
      AND difficulty_filter != 'easy'
  `;
  console.log(`\nquiz_questions: mapped to 'easy': ${easyF} rows`);

  const mediumF = await prisma.$executeRaw`
    UPDATE quiz_questions SET difficulty_filter = 'medium'
    WHERE LOWER(TRIM(difficulty_filter)) IN ('medium', 'intermediate', 'normal', 'avg', 'average')
      AND difficulty_filter != 'medium'
  `;
  console.log(`quiz_questions: mapped to 'medium': ${mediumF} rows`);

  const hardF = await prisma.$executeRaw`
    UPDATE quiz_questions SET difficulty_filter = 'hard'
    WHERE LOWER(TRIM(difficulty_filter)) IN ('hard', 'advanced', 'difficult')
      AND difficulty_filter != 'hard'
  `;
  console.log(`quiz_questions: mapped to 'hard': ${hardF} rows`);

  const nullF = await prisma.$executeRaw`
    UPDATE quiz_questions SET difficulty_filter = NULL
    WHERE difficulty_filter IS NOT NULL
      AND LOWER(TRIM(difficulty_filter)) NOT IN ('easy', 'medium', 'hard', 'beginner', 'basic', 'intermediate', 'normal', 'avg', 'average', 'advanced', 'difficult')
  `;
  console.log(`quiz_questions: set to NULL (unknown): ${nullF} rows`);

  console.log('\n--- After normalization ---\n');

  // Audit after
  const afterDistinct = await prisma.$queryRaw<{ difficulty: string; cnt: bigint }[]>`
    SELECT difficulty, COUNT(*)::int AS cnt FROM questions GROUP BY difficulty ORDER BY cnt DESC
  `;
  console.log('After — questions.difficulty distribution:');
  afterDistinct.forEach(r => console.log(`  ${JSON.stringify(r.difficulty)}: ${r.cnt}`));

  const afterFilterDistinct = await prisma.$queryRaw<{ difficulty_filter: string | null; cnt: bigint }[]>`
    SELECT difficulty_filter, COUNT(*)::int AS cnt FROM quiz_questions GROUP BY difficulty_filter ORDER BY cnt DESC
  `;
  console.log('\nAfter — quiz_questions.difficulty_filter distribution:');
  afterFilterDistinct.forEach(r => console.log(`  ${JSON.stringify(r.difficulty_filter)}: ${r.cnt}`));

  console.log('\nDone.');
}

main()
  .catch((e) => {
    console.error(decorateDatabaseConnectionError(e, connectionUrl));
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
