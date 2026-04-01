/**
 * Script to create an admin user
 * Usage: npx ts-node scripts/create-admin.ts
 */
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { getDatabaseUrl } from '../src/common/database-url';

dotenv.config({ path: '.env' });

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const supabaseUrl = process.env.SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const connectionUrl = getDatabaseUrl();
const pool = new Pool({
  connectionString: connectionUrl,
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const supabaseAdmin: SupabaseClient = createClient(supabaseUrl, serviceRoleKey);

async function createAdminUser() {
  const timestamp = Date.now();
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  const email = `admin.${timestamp}.${rand}@example.com`;
  const password = 'AdminPass123!';
  const fullName = `Admin User ${timestamp}`;

  console.log('Creating admin user...');
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log('');

  try {
    // 1. Create user in Supabase Auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
      },
    });

    if (authError) {
      // If user already exists in auth, try to get them
      if (authError.message.includes('already been registered')) {
        console.log('User already exists in Supabase Auth, checking database...');
        const existingUser = await prisma.profile.findUnique({ where: { email } });
        if (existingUser && existingUser.role === 'admin') {
          console.log('\n✅ Admin user already exists:');
          console.log(`   Email: ${email}`);
          console.log(`   Password: ${password}`);
          console.log(`   Role: ${existingUser.role}`);
          return;
        }
      } else {
        throw authError;
      }
    }

    const userId = authUser?.user?.id;
    if (!userId) {
      throw new Error('No user ID returned from Supabase');
    }

    // 2. Create or update profile with admin role
    const profile = await prisma.profile.upsert({
      where: { id: userId },
      update: { role: 'admin', fullName },
      create: {
        id: userId,
        email,
        fullName,
        role: 'admin',
        isActive: true,
        emailVerified: true,
      },
    });

    console.log('\n✅ Admin user created successfully!');
    console.log('');
    console.log('=== ADMIN CREDENTIALS ===');
    console.log(`Email:    ${email}`);
    console.log(`Password: ${password}`);
    console.log(`Role:     ${profile.role}`);
    console.log('');
    console.log('Save these credentials!');

  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser()
  .then(() => {
    console.log('\nDone!');
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });