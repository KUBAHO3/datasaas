import "server-only";

import { Resend } from "resend";
import { EMAIL_FROM, RESEND_MAIL_API_KEY } from "@/lib/env-config";

const resend = new Resend(RESEND_MAIL_API_KEY);

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      throw new Error(error.message);
    }

    return { success: true, data };
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}

export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string,
  userName?: string
) {
  const html = generatePasswordResetEmailHTML(resetUrl, userName);

  return sendEmail({
    to: email,
    subject: "Reset Your DataSaaS Password",
    html,
  });
}

function generatePasswordResetEmailHTML(
  resetUrl: string,
  userName?: string
): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
              
              <!-- Header -->
              <tr>
                <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid #e2e8f0;">
                  <div style="display: inline-block; background-color: #1e293b; width: 48px; height: 48px; border-radius: 8px; margin-bottom: 16px;">
                    <span style="color: #ffffff; font-size: 20px; font-weight: bold; line-height: 48px;">DS</span>
                  </div>
                  <h1 style="margin: 0; color: #1e293b; font-size: 24px; font-weight: 600;">DataSaaS</h1>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 40px;">
                  <h2 style="margin: 0 0 16px; color: #1e293b; font-size: 20px; font-weight: 600;">
                    Reset Your Password
                  </h2>
                  
                  ${
                    userName
                      ? `<p style="margin: 0 0 16px; color: #475569; font-size: 16px; line-height: 24px;">Hi ${userName},</p>`
                      : ""
                  }
                  
                  <p style="margin: 0 0 24px; color: #475569; font-size: 16px; line-height: 24px;">
                    We received a request to reset your password for your DataSaaS account. Click the button below to create a new password.
                  </p>

                  <!-- CTA Button -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 0 0 24px;">
                        <a href="${resetUrl}" 
                           style="display: inline-block; background-color: #1e293b; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                          Reset Password
                        </a>
                      </td>
                    </tr>
                  </table>

                  <!-- Alternative Link -->
                  <p style="margin: 0 0 24px; color: #64748b; font-size: 14px; line-height: 20px;">
                    Or copy and paste this link into your browser:
                  </p>
                  <p style="margin: 0 0 32px; padding: 12px; background-color: #f1f5f9; border-radius: 4px; color: #475569; font-size: 13px; word-break: break-all;">
                    ${resetUrl}
                  </p>

                  <!-- Security Info -->
                  <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 4px; margin-bottom: 24px;">
                    <p style="margin: 0 0 8px; color: #92400e; font-weight: 600; font-size: 14px;">
                      ⚠️ Security Notice
                    </p>
                    <ul style="margin: 0; padding-left: 20px; color: #92400e; font-size: 14px; line-height: 20px;">
                      <li>This link will expire in <strong>1 hour</strong></li>
                      <li>If you didn't request this reset, please ignore this email</li>
                      <li>Never share this link with anyone</li>
                      <li>For security, you'll be logged out of all devices after reset</li>
                    </ul>
                  </div>

                  <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 20px;">
                    If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 24px 40px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; border-radius: 0 0 8px 8px;">
                  <p style="margin: 0 0 8px; color: #64748b; font-size: 14px; text-align: center;">
                    © ${new Date().getFullYear()} DataSaaS. All rights reserved.
                  </p>
                  <p style="margin: 0; color: #94a3b8; font-size: 12px; text-align: center;">
                    This is an automated email. Please do not reply.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

export async function sendPasswordChangedEmail(
  email: string,
  userName?: string
) {
  const html = generatePasswordChangedEmailHTML(userName);

  return sendEmail({
    to: email,
    subject: "Your DataSaaS Password Was Changed",
    html,
  });
}

function generatePasswordChangedEmailHTML(userName?: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Changed</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
              
              <!-- Header -->
              <tr>
                <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid #e2e8f0;">
                  <div style="display: inline-block; background-color: #1e293b; width: 48px; height: 48px; border-radius: 8px; margin-bottom: 16px;">
                    <span style="color: #ffffff; font-size: 20px; font-weight: bold; line-height: 48px;">DS</span>
                  </div>
                  <h1 style="margin: 0; color: #1e293b; font-size: 24px; font-weight: 600;">DataSaaS</h1>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 40px;">
                  <!-- Success Icon -->
                  <div style="text-align: center; margin-bottom: 24px;">
                    <div style="display: inline-block; background-color: #dcfce7; width: 64px; height: 64px; border-radius: 50%;">
                      <span style="color: #16a34a; font-size: 32px; line-height: 64px;">✓</span>
                    </div>
                  </div>

                  <h2 style="margin: 0 0 16px; color: #1e293b; font-size: 20px; font-weight: 600; text-align: center;">
                    Password Successfully Changed
                  </h2>
                  
                  ${
                    userName
                      ? `<p style="margin: 0 0 16px; color: #475569; font-size: 16px; line-height: 24px;">Hi ${userName},</p>`
                      : ""
                  }
                  
                  <p style="margin: 0 0 24px; color: #475569; font-size: 16px; line-height: 24px;">
                    Your DataSaaS account password was successfully changed. For security reasons, you have been logged out of all devices.
                  </p>

                  <!-- Security Alert -->
                  <div style="background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 16px; border-radius: 4px; margin-bottom: 24px;">
                    <p style="margin: 0 0 8px; color: #991b1b; font-weight: 600; font-size: 14px;">
                      🔒 Didn't make this change?
                    </p>
                    <p style="margin: 0; color: #991b1b; font-size: 14px; line-height: 20px;">
                      If you didn't change your password, please contact our support team immediately at support@datasaas.com
                    </p>
                  </div>

                  <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 20px;">
                    You can now sign in with your new password on any device.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 24px 40px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; border-radius: 0 0 8px 8px;">
                  <p style="margin: 0 0 8px; color: #64748b; font-size: 14px; text-align: center;">
                    © ${new Date().getFullYear()} DataSaaS. All rights reserved.
                  </p>
                  <p style="margin: 0; color: #94a3b8; font-size: 12px; text-align: center;">
                    This is an automated email. Please do not reply.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}
