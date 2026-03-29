require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool } = require('pg');

async function main() {
  const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;
  if (!connectionString) throw new Error('Missing DATABASE_URL/DIRECT_URL');

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  const email = 'claw.student+regression@example.com';
  const quizId = 'ae59ce08-7620-4bff-86a6-8b72e21b8bbc';

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const profileRes = await client.query(
      'select id, email from public.profiles where email = $1 limit 1',
      [email]
    );
    if (!profileRes.rows.length) throw new Error('Regression learner not found');
    const userId = profileRes.rows[0].id;

    const attemptsRes = await client.query(
      'select id, attempt_number, status from public.quiz_attempts where quiz_id = $1 and user_id = $2 order by created_at asc',
      [quizId, userId]
    );

    const attemptIds = attemptsRes.rows.map(r => r.id);
    if (attemptIds.length) {
      await client.query('delete from public.quiz_answers where attempt_id = any($1::uuid[])', [attemptIds]);
      await client.query('delete from public.attempt_questions where attempt_id = any($1::uuid[])', [attemptIds]);
      await client.query('delete from public.quiz_attempts where id = any($1::uuid[])', [attemptIds]);
    }

    await client.query('COMMIT');
    console.log(JSON.stringify({ userId, deletedAttempts: attemptsRes.rows }, null, 2));
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
