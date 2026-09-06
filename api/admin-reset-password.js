import crypto from 'crypto';

function hashPassword(password) {
  const salt = process.env.PASSWORD_SALT || 'lam-hub-salt-v1';
  return crypto.createHash('sha256').update(salt + String(password)).digest('hex');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token, newPassword } = req.body || {};
  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token and new password required' });
  }
  if (String(newPassword).length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL || 'https://fvqguvzxgytsgcgqhcxx.supabase.co';
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2cWd1dnp4Z3l0c2djZ3FoY3h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0MDMxNjYsImV4cCI6MjEwMzk3OTE2Nn0.U7SRJI6KP8sE3fqGL99t0mGekkBL0Q7UdjF-7bdc2U8';

  try {
    const url = `${SUPABASE_URL}/rest/v1/employees?reset_token=eq.${encodeURIComponent(token)}&role=eq.admin&select=*`;
    const r = await fetch(url, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    });
    const rows = await r.json();
    if (!Array.isArray(rows) || !rows.length) {
      return res.status(400).json({ error: 'Invalid or expired reset link' });
    }
    const admin = rows[0];
    if (admin.reset_expires && new Date(admin.reset_expires) < new Date()) {
      return res.status(400).json({ error: 'Reset link has expired' });
    }
    const newHash = hashPassword(newPassword);
    const upd = await fetch(`${SUPABASE_URL}/rest/v1/employees?id=eq.${admin.id}`, {
      method: 'PATCH',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ password_hash: newHash, reset_token: null, reset_expires: null }),
    });
    if (!upd.ok) {
      return res.status(500).json({ error: 'Could not update password' });
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message || 'Failed' });
  }
}
