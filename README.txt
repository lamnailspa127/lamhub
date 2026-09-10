LAM HUB - Deployment
====================

Upload these to GitHub (repo root):
- index.html
- logo.jpg
- manifest.json
- vercel.json
- icon-*.png, apple-touch-icon.png, favicon-32.png
- api/ folder (all files inside)

Vercel Environment Variables (Settings → Environment Variables):
  RESEND_API_KEY     = your Resend API key (from resend.com)
  ADMIN_PASSWORD     = bootstrap password (until you create an Admin staff)
  SUPABASE_URL       = https://fvqguvzxgytsgcgqhcxx.supabase.co
  SUPABASE_ANON_KEY  = your Supabase anon public key (optional for API routes)

Never put API keys inside code or README — only in Vercel.

After saving env vars → Redeploy.

Admin login:
- First time: use ADMIN_PASSWORD, then create yourself in Staff as Role=Admin + password
- Later: login with admin email + password
