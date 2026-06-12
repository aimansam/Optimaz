import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(email: string): Promise<void> {
  const from = process.env.RESEND_FROM_EMAIL ?? 'noreply@optimaz.app';

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 24px; background: #fff;">

      <!-- Logo -->
      <div style="text-align: center; margin-bottom: 32px;">
        <img src="https://optimaz.app/icon-192x192.png" alt="Optimaz" width="56" height="56" style="border-radius: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.10);" />
        <div style="font-size: 22px; font-weight: 700; color: #0f172a; margin-top: 12px; letter-spacing: -0.5px;">Optimaz</div>
      </div>

      <!-- Welcome headline -->
      <h1 style="font-size: 26px; font-weight: 800; color: #0f172a; text-align: center; margin: 0 0 8px; letter-spacing: -0.5px;">
        Welcome aboard 🎉
      </h1>
      <p style="font-size: 15px; color: #64748b; text-align: center; margin: 0 0 32px; line-height: 1.6;">
        Your Optimaz workspace is ready. Tasks, projects, and goals — all in one quiet place.
      </p>

      <!-- CTA button -->
      <div style="text-align: center; margin-bottom: 40px;">
        <a href="https://optimaz.app/dashboard"
           style="display: inline-block; background: #6366f1; color: #fff; font-size: 15px; font-weight: 600; padding: 13px 32px; border-radius: 10px; text-decoration: none; letter-spacing: -0.2px;">
          Open my workspace →
        </a>
      </div>

      <!-- Divider -->
      <div style="border-top: 1px solid #e2e8f0; margin-bottom: 32px;"></div>

      <!-- PWA Install section -->
      <h2 style="font-size: 16px; font-weight: 700; color: #0f172a; margin: 0 0 6px;">
        📲 Install on your devices
      </h2>
      <p style="font-size: 13px; color: #64748b; margin: 0 0 16px; line-height: 1.6;">
        Optimaz is a Progressive Web App — install it for a full app-like experience with no download required.
      </p>

      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 12px; background: #f8fafc; border-radius: 8px; margin-bottom: 8px; display: block;">
            <strong style="color: #0f172a; font-size: 13px;">📱 iPhone / iPad</strong><br/>
            <span style="color: #64748b; font-size: 13px;">Open <strong>optimaz.app</strong> in <strong>Safari</strong> → tap the Share button (□↑) → tap <strong>"Add to Home Screen"</strong></span>
          </td>
        </tr>
        <tr><td style="height: 8px;"></td></tr>
        <tr>
          <td style="padding: 10px 12px; background: #f8fafc; border-radius: 8px; display: block;">
            <strong style="color: #0f172a; font-size: 13px;">🤖 Android</strong><br/>
            <span style="color: #64748b; font-size: 13px;">Open in <strong>Chrome</strong> → tap the menu (⋮) → tap <strong>"Add to Home Screen"</strong> or <strong>"Install app"</strong></span>
          </td>
        </tr>
        <tr><td style="height: 8px;"></td></tr>
        <tr>
          <td style="padding: 10px 12px; background: #f8fafc; border-radius: 8px; display: block;">
            <strong style="color: #0f172a; font-size: 13px;">💻 Desktop (Chrome / Edge)</strong><br/>
            <span style="color: #64748b; font-size: 13px;">Look for the <strong>install icon ⊕</strong> in the address bar, or go to the browser menu → <strong>"Install Optimaz"</strong></span>
          </td>
        </tr>
      </table>

      <!-- Divider -->
      <div style="border-top: 1px solid #e2e8f0; margin: 32px 0 24px;"></div>

      <!-- Footer -->
      <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0; line-height: 1.6;">
        You're receiving this because you just created an Optimaz account with this email address.<br/>
        Questions? Reply to this email or contact us at <a href="mailto:hello@optimaz.app" style="color: #6366f1; text-decoration: none;">hello@optimaz.app</a>
      </p>
    </div>
  `;

  const text = `Welcome to Optimaz!

Your workspace is ready. Open it at: https://optimaz.app/dashboard

---
Install on your devices (no download needed):

iPhone/iPad:
Open optimaz.app in Safari → tap Share (□↑) → "Add to Home Screen"

Android:
Open in Chrome → tap menu (⋮) → "Add to Home Screen" or "Install app"

Desktop (Chrome/Edge):
Look for the install icon ⊕ in the address bar, or browser menu → "Install Optimaz"

---
Questions? Email us at hello@optimaz.app`;

  try {
    await resend.emails.send({
      from,
      to: email,
      subject: 'Welcome to Optimaz 🎉',
      html,
      text,
    });
  } catch (err) {
    // Fire-and-forget — log but don't fail the sign-in flow
    console.error('[welcome-email] failed to send:', err);
  }
}
