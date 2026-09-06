import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'Email required' });

  const SUPABASE_URL = process.env.SUPABASE_URL || 'https://fvqguvzxgytsgcgqhcxx.supabase.co';
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2cWd1dnp4Z3l0c2djZ3FoY3h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0MDMxNjYsImV4cCI6MjEwMzk3OTE2Nn0.U7SRJI6KP8sE3fqGL99t0mGekkBL0Q7UdjF-7bdc2U8';
  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  try {
    const url = `${SUPABASE_URL}/rest/v1/employees?email=eq.${encodeURIComponent(email.trim().toLowerCase())}&role=eq.admin&select=*`;
    const r = await fetch(url, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    });
    const rows = await r.json();
    // Always return ok to avoid email enumeration
    if (!Array.isArray(rows) || !rows.length) {
      return res.status(200).json({ ok: true, message: 'If this email is an admin, a reset link was sent.' });
    }
    const admin = rows[0];
    const token = crypto.randomBytes(24).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    await fetch(`${SUPABASE_URL}/rest/v1/employees?id=eq.${admin.id}`, {
      method: 'PATCH',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ reset_token: token, reset_expires: expires }),
    });

    const origin = req.headers.origin || req.headers.referer || 'https://lamhub.vercel.app';
    const base = String(origin).replace(/\/$/, '').split('/').slice(0, 3).join('/');
    const resetLink = `${base}/#reset=${token}`;

    if (RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'LAM NAIL SPA <lamhub@lamnailspa.ca>',
          to: [admin.email],
          subject: 'LAM Hub – Reset your admin password',
          html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
            <h2>Reset password</h2>
            <p>Hi ${admin.name || 'Admin'},</p>
            <p>Click the button below to set a new password (valid for 1 hour):</p>
            <p style="margin:24px 0"><a href="${resetLink}" style="background:#7c3aed;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:600">Reset password</a></p>
            <p style="font-size:12px;color:#888;word-break:break-all">${resetLink}</p>
          </div>`,
        }),
      });
    }

    return res.status(200).json({ ok: true, message: 'If this email is an admin, a reset link was sent.' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message || 'Failed' });
  }
}
