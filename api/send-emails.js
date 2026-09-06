// Vercel Serverless Function - sends policy confirmation emails via Resend
// API key MUST come from Vercel Environment Variable: RESEND_API_KEY
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const FROM_EMAIL = 'LAM NAIL SPA <lamhub@lamnailspa.ca>';

  if (!RESEND_API_KEY) {
    return res.status(500).json({
      error: 'RESEND_API_KEY is not set. Add it in Vercel → Settings → Environment Variables.'
    });
  }

  try {
    const { emails } = req.body;

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ error: 'No emails provided' });
    }

    const results = [];

    for (const item of emails) {
      const { to, name, policyTitle, link } = item;
      if (!to) continue;

      const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #111; font-size: 22px; margin: 0;">LAM NAIL SPA</h1>
            <p style="color: #666; font-size: 14px; margin: 4px 0 0;">Staff Policy & Training Hub</p>
          </div>
          <p style="font-size: 16px; color: #333;">Hi ${name || 'there'},</p>
          <p style="font-size: 15px; color: #444; line-height: 1.5;">
            Please review and confirm the following policy:
          </p>
          <div style="background: #f5f3ff; border-radius: 12px; padding: 16px 20px; margin: 20px 0;">
            <strong style="font-size: 17px; color: #5b21b6;">${policyTitle}</strong>
          </div>
          <p style="font-size: 15px; color: #444;">
            Tap the button below on your phone to read the full policy and sign:
          </p>
          <div style="text-align: center; margin: 28px 0;">
            <a href="${link}" style="display: inline-block; background: #7c3aed; color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: 600; font-size: 15px;">
              Open & Confirm Policy
            </a>
          </div>
          <p style="font-size: 13px; color: #888; line-height: 1.4;">
            Or copy this link:<br>
            <a href="${link}" style="color: #7c3aed; word-break: break-all;">${link}</a>
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 28px 0;">
          <p style="font-size: 12px; color: #999; text-align: center;">
            LAM NAIL SPA • Est. 2023<br>
            This email was sent automatically. Please do not reply.
          </p>
        </div>
      `;

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [to],
          subject: `LAM NAIL SPA – Please confirm: ${policyTitle}`,
          html
        })
      });

      const data = await response.json();
      results.push({ to, success: response.ok, data });
    }

    const failed = results.filter(r => !r.success);
    if (failed.length === results.length) {
      return res.status(500).json({ error: 'All emails failed', results });
    }

    return res.status(200).json({ ok: true, results });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || 'Failed to send emails' });
  }
}
