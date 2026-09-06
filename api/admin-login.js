export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  // Set ADMIN_PASSWORD in Vercel Environment Variables
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'LAM2024!';
  const { password } = req.body || {};
  if (!password || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Wrong password' });
  }
  // Simple session token (not JWT - fine for this app)
  const token = Buffer.from('lam-admin:' + Date.now()).toString('base64');
  return res.status(200).json({ ok: true, token });
}
