LAM STAFF HUB - Deployment Instructions
=======================================

FILES TO UPLOAD TO GITHUB (root of repo):
- index.html
- logo.jpg
- api/send-emails.js   ← important! keep the "api" folder

OPTIONAL (recommended for security):
In Vercel project → Settings → Environment Variables
Add:
  Name:  RESEND_API_KEY
  Value: re_9CD7d5ue_QGyrm7m5kX3zWZcsFWzmd3mf

Then Redeploy.

HOW IT WORKS:
1. Admin adds staff (Name + Email)
2. Create Policy → assign staff → Publish
3. System automatically emails every assigned staff with the confirmation link
4. Staff open the link on any phone → sign → confirm
5. Admin sees status update in Live tab

From email: lamhub@lamnailspa.ca
