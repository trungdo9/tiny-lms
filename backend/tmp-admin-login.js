require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
(async () => {
  try {
  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const admin = createClient(url, service);
  const client = createClient(url, anon);
  const email = process.env.TEST_ADMIN_EMAIL || 'claw.admin+dbfix@example.com';
  const password = process.env.TEST_ADMIN_PASSWORD || 'ClawFix!2026';

  const list = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  let user = list.data?.users?.find(u => u.email === email);
  if (!user) {
    const created = await admin.auth.admin.createUser({ email, password, email_confirm: true });
    if (created.error) throw created.error;
    user = created.data.user;
  } else {
    const updated = await admin.auth.admin.updateUserById(user.id, { password, email_confirm: true });
    if (updated.error) throw updated.error;
    user = updated.data.user;
  }

  const now = new Date().toISOString();
  const up = await admin.from('profiles').upsert({ id: user.id, email, role: 'admin', is_active: true, created_at: now, updated_at: now }, { onConflict: 'id' }).select().single();
  if (up.error) throw up.error;

  const signIn = await client.auth.signInWithPassword({ email, password });
  if (signIn.error) throw signIn.error;
  console.log(JSON.stringify({ email, password, userId: user.id, accessToken: signIn.data.session.access_token }, null, 2));
  } catch (e) {
    console.error(JSON.stringify(e, null, 2));
    process.exit(1);
  }
})();
