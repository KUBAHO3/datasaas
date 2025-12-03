import "server-only";

import { sendEmail } from "./resend";
import { APP_URL } from "@/lib/env-config";

export async function sendCompanyApprovedEmail(
  email: string,
  companyName: string,
  ownerName?: string
) {
  const html = generateCompanyApprovedEmailHTML(companyName, ownerName);

  return sendEmail({
    to: email,
    subject: `Welcome to DataSaaS - ${companyName} Approved! 🎉`,
    html,
  });
}

function generateCompanyApprovedEmailHTML(
  companyName: string,
  ownerName?: string
): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Company Approved</title>
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
                    Your Company Has Been Approved!
                  </h2>
                  
                  ${
                    ownerName
                      ? `<p style="margin: 0 0 16px; color: #475569; font-size: 16px; line-height: 24px;">Hi ${ownerName},</p>`
                      : ""
                  }
                  
                  <p style="margin: 0 0 24px; color: #475569; font-size: 16px; line-height: 24px;">
                    Congratulations! <strong>${companyName}</strong> has been approved and your account is now active on DataSaaS.
                  </p>

                  <!-- Next Steps -->
                  <div style="background-color: #f0f9ff; border-left: 4px solid #0284c7; padding: 16px; border-radius: 4px; margin-bottom: 24px;">
                    <p style="margin: 0 0 12px; color: #075985; font-weight: 600; font-size: 14px;">
                      🚀 Next Steps:
                    </p>
                    <ul style="margin: 0; padding-left: 20px; color: #075985; font-size: 14px; line-height: 24px;">
                      <li>Sign in to your company dashboard</li>
                      <li>Set up your team members</li>
                      <li>Configure your data collection forms</li>
                      <li>Start collecting and managing data</li>
                    </ul>
                  </div>

                  <!-- CTA Button -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 0 0 24px;">
                        <a href="${APP_URL}/company/dashboard" 
                           style="display: inline-block; background-color: #1e293b; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                          Go to Dashboard
                        </a>
                      </td>
                    </tr>
                  </table>

                  <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 20px; text-align: center;">
                    Need help getting started? Check our <a href="${APP_URL}/docs" style="color: #0284c7;">documentation</a> or contact support.
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

export async function sendCompanyRejectedEmail(
  email: string,
  companyName: string,
  reason: string,
  ownerName?: string
) {
  const html = generateCompanyRejectedEmailHTML(companyName, reason, ownerName);

  return sendEmail({
    to: email,
    subject: `Application Update - ${companyName}`,
    html,
  });
}

function generateCompanyRejectedEmailHTML(
  companyName: string,
  reason: string,
  ownerName?: string
): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Application Update</title>
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
                    Application Status Update
                  </h2>
                  
                  ${
                    ownerName
                      ? `<p style="margin: 0 0 16px; color: #475569; font-size: 16px; line-height: 24px;">Hi ${ownerName},</p>`
                      : ""
                  }
                  
                  <p style="margin: 0 0 24px; color: #475569; font-size: 16px; line-height: 24px;">
                    Thank you for your interest in DataSaaS. After reviewing your application for <strong>${companyName}</strong>, we regret to inform you that we are unable to approve it at this time.
                  </p>

                  <!-- Reason -->
                  <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; border-radius: 4px; margin-bottom: 24px;">
                    <p style="margin: 0 0 8px; color: #991b1b; font-weight: 600; font-size: 14px;">
                      Reason for Rejection:
                    </p>
                    <p style="margin: 0; color: #991b1b; font-size: 14px; line-height: 20px;">
                      ${reason}
                    </p>
                  </div>

                  <!-- Next Steps -->
                  <div style="background-color: #f0f9ff; border-left: 4px solid #0284c7; padding: 16px; border-radius: 4px; margin-bottom: 24px;">
                    <p style="margin: 0 0 12px; color: #075985; font-weight: 600; font-size: 14px;">
                      What You Can Do:
                    </p>
                    <ul style="margin: 0; padding-left: 20px; color: #075985; font-size: 14px; line-height: 24px;">
                      <li>Review and address the concerns mentioned above</li>
                      <li>Submit a new application with updated information</li>
                      <li>Contact our support team for clarification</li>
                    </ul>
                  </div>

                  <!-- CTA Button -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 0 0 24px;">
                        <a href="${APP_URL}/contact" 
                           style="display: inline-block; background-color: #1e293b; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                          Contact Support
                        </a>
                      </td>
                    </tr>
                  </table>

                  <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 20px;">
                    We appreciate your understanding and hope to work with you in the future.
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

export async function sendCompanySuspendedEmail(
  email: string,
  companyName: string,
  reason: string,
  ownerName?: string
) {
  const html = generateCompanySuspendedEmailHTML(
    companyName,
    reason,
    ownerName
  );

  return sendEmail({
    to: email,
    subject: `Important: ${companyName} Account Suspended`,
    html,
  });
}

function generateCompanySuspendedEmailHTML(
  companyName: string,
  reason: string,
  ownerName?: string
): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Account Suspended</title>
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
                  <!-- Warning Icon -->
                  <div style="text-align: center; margin-bottom: 24px;">
                    <div style="display: inline-block; background-color: #fef2f2; width: 64px; height: 64px; border-radius: 50%;">
                      <span style="color: #dc2626; font-size: 32px; line-height: 64px;">⚠</span>
                    </div>
                  </div>

                  <h2 style="margin: 0 0 16px; color: #1e293b; font-size: 20px; font-weight: 600; text-align: center;">
                    Account Suspended
                  </h2>
                  
                  ${
                    ownerName
                      ? `<p style="margin: 0 0 16px; color: #475569; font-size: 16px; line-height: 24px;">Hi ${ownerName},</p>`
                      : ""
                  }
                  
                  <p style="margin: 0 0 24px; color: #475569; font-size: 16px; line-height: 24px;">
                    Your account for <strong>${companyName}</strong> has been temporarily suspended. During this time, you will not be able to access your data or use DataSaaS services.
                  </p>

                  <!-- Reason -->
                  <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; border-radius: 4px; margin-bottom: 24px;">
                    <p style="margin: 0 0 8px; color: #991b1b; font-weight: 600; font-size: 14px;">
                      Reason for Suspension:
                    </p>
                    <p style="margin: 0; color: #991b1b; font-size: 14px; line-height: 20px;">
                      ${reason}
                    </p>
                  </div>

                  <!-- Next Steps -->
                  <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 4px; margin-bottom: 24px;">
                    <p style="margin: 0 0 12px; color: #92400e; font-weight: 600; font-size: 14px;">
                      What Happens Next:
                    </p>
                    <ul style="margin: 0; padding-left: 20px; color: #92400e; font-size: 14px; line-height: 24px;">
                      <li>Your data is safe and will not be deleted</li>
                      <li>Team members cannot access the account</li>
                      <li>All active services are paused</li>
                      <li>Contact support to resolve the issue</li>
                    </ul>
                  </div>

                  <!-- CTA Button -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 0 0 24px;">
                        <a href="${APP_URL}/contact" 
                           style="display: inline-block; background-color: #dc2626; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                          Contact Support Immediately
                        </a>
                      </td>
                    </tr>
                  </table>

                  <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 20px; text-align: center;">
                    Questions? Email us at support@datasaas.com
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

export async function sendCompanyActivatedEmail(
  email: string,
  companyName: string,
  ownerName?: string
) {
  const html = generateCompanyActivatedEmailHTML(companyName, ownerName);

  return sendEmail({
    to: email,
    subject: `Good News - ${companyName} Account Reactivated! 🎉`,
    html,
  });
}

function generateCompanyActivatedEmailHTML(
  companyName: string,
  ownerName?: string
): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Account Reactivated</title>
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
                    Your Account Has Been Reactivated!
                  </h2>
                  
                  ${
                    ownerName
                      ? `<p style="margin: 0 0 16px; color: #475569; font-size: 16px; line-height: 24px;">Hi ${ownerName},</p>`
                      : ""
                  }
                  
                  <p style="margin: 0 0 24px; color: #475569; font-size: 16px; line-height: 24px;">
                    Great news! Your account for <strong>${companyName}</strong> has been reactivated. You now have full access to all DataSaaS services.
                  </p>

                  <!-- What's Restored -->
                  <div style="background-color: #dcfce7; border-left: 4px solid #16a34a; padding: 16px; border-radius: 4px; margin-bottom: 24px;">
                    <p style="margin: 0 0 12px; color: #166534; font-weight: 600; font-size: 14px;">
                      ✅ Everything Is Back:
                    </p>
                    <ul style="margin: 0; padding-left: 20px; color: #166534; font-size: 14px; line-height: 24px;">
                      <li>Full dashboard access restored</li>
                      <li>All your data is intact and accessible</li>
                      <li>Team members can log in again</li>
                      <li>All services are operational</li>
                    </ul>
                  </div>

                  <!-- CTA Button -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 0 0 24px;">
                        <a href="${APP_URL}/company/dashboard" 
                           style="display: inline-block; background-color: #1e293b; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                          Access Your Dashboard
                        </a>
                      </td>
                    </tr>
                  </table>

                  <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 20px; text-align: center;">
                    Thank you for your patience. We're glad to have you back!
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
