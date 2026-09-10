import crypto from 'crypto';

function hashPassword(password) {
  const salt = process.env.PASSWORD_SALT || 'lam-hub-salt-v1';
  return crypto.createHash('sha256').update(salt + String(password)).digest('hex');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL || 'https://fvqguvzxgytsgcgqhcxx.supabase.co';
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

  try {
    const url = `${SUPABASE_URL}/rest/v1/employees?email=eq.${encodeURIComponent(email.trim().toLowerCase())}&role=eq.admin&select=*`;
    const r = await fetch(url, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    });
    const rows = await r.json();
    if (!Array.isArray(rows) || !rows.length) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const admin = rows[0];
    if (!admin.password_hash) {
      return res.status(401).json({ error: 'Password not set for this admin. Use Forgot password or set password in Staff.' });
    }
    const hash = hashPassword(password);
    if (hash !== admin.password_hash) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    return res.status(200).json({
      ok: true,
      admin: { id: admin.id, name: admin.name, email: admin.email },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message || 'Login failed' });
  }
}
