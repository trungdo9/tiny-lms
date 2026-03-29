function maskUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.password) parsed.password = '***';
    return parsed.toString();
  } catch {
    return url.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:***@');
  }
}

function buildSupabaseIpv6Hint(connectionUrl: string): string {
  let hostname = '';

  try {
    hostname = new URL(connectionUrl).hostname;
  } catch {
    return '';
  }

  if (!/\.supabase\.co$/i.test(hostname)) {
    return '';
  }

  if (!/^db\./i.test(hostname)) {
    return '';
  }

  return [
    'Detected a Supabase direct database host (db.<project-ref>.supabase.co).',
    'Supabase direct Postgres endpoints are IPv6-first / IPv6-only by default.',
    'If this machine does not have working IPv6, switch backend connectivity to a Supavisor/pooler connection string over IPv4.',
    'Recommended fix: set DIRECT_URL (preferred) or DATABASE_URL to the Supabase Session pooler URL on port 5432 for persistent backend traffic.',
  ].join(' ');
}

export function getDatabaseUrl(): string {
  const url = process.env.DIRECT_URL || process.env.DATABASE_URL;

  if (!url) {
    throw new Error('Missing database connection string. Set DIRECT_URL or DATABASE_URL.');
  }

  return url;
}

export function decorateDatabaseConnectionError(error: unknown, connectionUrl: string): Error {
  const original = error instanceof Error ? error : new Error(String(error));
  const code = (original as NodeJS.ErrnoException).code;
  const supabaseHint = buildSupabaseIpv6Hint(connectionUrl);

  if (code === 'ENETUNREACH' || code === 'EHOSTUNREACH' || code === 'ECONNREFUSED' || code === 'ETIMEDOUT') {
    const message = [
      `Database connection failed for ${maskUrl(connectionUrl)}.`,
      original.message,
      supabaseHint,
    ]
      .filter(Boolean)
      .join(' ');

    const wrapped = new Error(message);
    wrapped.stack = original.stack;
    return wrapped;
  }

  return original;
}
