# SendGrid Email Setup

Email notifications for answer submissions are now sent via **SendGrid** instead of Gmail.

## Prerequisites

1. Create a SendGrid account at https://sendgrid.com
2. Create an API key in SendGrid dashboard:
   - Go to **Settings → API Keys**
   - Click **Create API Key**
   - Name it (e.g., "ADO Health ICMR")
   - Choose "Restricted Access" and enable `Mail Send`
   - Copy the API key (you'll only see it once)

## Environment Variables

Add the following to your `.env.local` (development) or Vercel Secrets (production):

```
SENDGRID_API_KEY=your_sendgrid_api_key_here
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
```

### Required:
- **`SENDGRID_API_KEY`** — Your SendGrid API key (from step above)

### Optional:
- **`SENDGRID_FROM_EMAIL`** — Sender email address (defaults to `noreply@adohealthicmr.com`)

## Setting Up Vercel

1. Go to your Vercel project settings
2. Navigate to **Settings → Environment Variables**
3. Add:
   ```
   SENDGRID_API_KEY = <your_api_key>
   SENDGRID_FROM_EMAIL = noreply@yourdomain.com
   ```
4. Redeploy the app

## Verifying

Once configured, answer submissions will send email notifications to `adohealthicr2025@gmail.com`.

If `SENDGRID_API_KEY` is missing, the app will log a warning and skip email sending (but won't break).

## Troubleshooting

- **No email received:** Check that the API key is correct and has `Mail Send` permission enabled.
- **"Email could not be sent" in UI:** Check server logs for SendGrid errors.
- **Verify:** You can test by submitting an answer in the app; check the server/Vercel logs.
