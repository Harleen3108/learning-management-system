/**
 * Lightweight mail abstraction.
 *
 * If the deployment provides SMTP env vars (SMTP_HOST, SMTP_USER, SMTP_PASS,
 * EMAIL_FROM) we use nodemailer to actually deliver. Otherwise we log the
 * message to the server console and treat it as "delivered" so the rest of
 * the system (campaign sending, signup confirmation) keeps working in dev.
 *
 * To enable real delivery:
 *   1. `npm install nodemailer` in /backend
 *   2. Add the SMTP_* env vars to your .env
 */
let transporter = null;
let nodemailer = null;

try {
    nodemailer = require('nodemailer');
} catch (err) {
    nodemailer = null;
}

const isConfigured = () =>
    !!(nodemailer && process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

const getTransporter = () => {
    if (transporter) return transporter;
    if (!isConfigured()) return null;
    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
    return transporter;
};

/**
 * Send a single email. Returns { ok, info, fallback }.
 *  - ok=true if SMTP delivered successfully
 *  - fallback=true if SMTP isn't configured (we logged it instead)
 *  - ok=false if SMTP failed (info contains the error message)
 */
async function sendMail({ to, subject, html, text }) {
    if (!to || !subject) throw new Error('to and subject are required');

    const t = getTransporter();
    if (!t) {
        console.log('[mail] (dev fallback) SMTP not configured. Would have sent:');
        console.log('  to:', to);
        console.log('  subject:', subject);
        return { ok: true, fallback: true };
    }

    try {
        const info = await t.sendMail({
            from: process.env.EMAIL_FROM || `"EduFlow" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html,
            text: text || stripHtml(html)
        });
        return { ok: true, info };
    } catch (err) {
        console.error('[mail] sendMail failed:', err.message);
        return { ok: false, error: err.message };
    }
}

function stripHtml(html = '') {
    return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Wrap a campaign body in a basic styled HTML shell. Adds the open-tracking
 * pixel + the unsubscribe / preferences footer.
 */
function buildCampaignHtml({ subject, body, trackingPixelUrl, unsubscribeUrl, preferencesUrl }) {
    const safeBody = body.includes('<') ? body : `<p>${escape(body).replace(/\n/g, '<br/>')}</p>`;
    return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
    <div style="text-align:center;padding-bottom:24px;">
      <span style="font-size:22px;font-weight:600;color:#071739;letter-spacing:-0.02em;">EduFlow</span>
    </div>
    <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:32px;">
      <h1 style="margin:0 0 16px;font-size:22px;font-weight:600;color:#0f172a;line-height:1.3;">${escape(subject)}</h1>
      <div style="font-size:14px;line-height:1.6;color:#334155;">
        ${safeBody}
      </div>
    </div>
    <p style="text-align:center;font-size:11px;color:#94a3b8;margin-top:24px;line-height:1.6;">
      You're receiving this because you subscribed to EduFlow updates.<br/>
      <a href="${preferencesUrl}" style="color:#071739;">Update preferences</a>
      &nbsp;·&nbsp;
      <a href="${unsubscribeUrl}" style="color:#071739;">Unsubscribe</a>
    </p>
    ${trackingPixelUrl ? `<img src="${trackingPixelUrl}" width="1" height="1" alt="" style="display:block;width:1px;height:1px;border:0;" />` : ''}
  </div>
</body></html>`;
}

function escape(s = '') {
    return String(s).replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[c]);
}

module.exports = { sendMail, buildCampaignHtml, isConfigured };
