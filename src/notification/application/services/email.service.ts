import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

import { UserService } from '../../../user/services/user.service';

@Injectable()
export class EmailService {
  private readonly resend: Resend;
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {
    this.resend = new Resend(this.configService.get<string>('resend.apiKey'));
  }

  async sendBroadcastEmail(
    title: string,
    message: string,
  ): Promise<{ sent: number; failed: number }> {
    const users = await this.userService.getAllUsers();
    const validUsers = users.filter(
      (user) => user.email && !user.isAccountDisabled,
    );

    this.logger.log(
      `Email broadcast: ${validUsers.length} valid emails out of ${users.length} users`,
    );

    if (validUsers.length === 0) {
      return { sent: 0, failed: 0 };
    }

    const html = this.buildEmailHtml(title, message);
    let sent = 0;
    let failed = 0;

    for (const user of validUsers) {
      try {
        await this.resend.emails.send({
          from: 'IDRMC <noreply@nbayeabsira.dev>',
          to: [user.email],
          subject: title,
          html,
        });
        sent++;
      } catch (error) {
        this.logger.error(
          `Email broadcast: failed to send to ${user.email} - ${error}`,
        );
        failed++;
      }
    }

    this.logger.log(`Email broadcast: sent=${sent} failed=${failed}`);
    return { sent, failed };
  }

  private buildEmailHtml(title: string, message: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#dc2626,#991b1b);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:2px;opacity:0.9;">IDRMC</h1>
              <p style="margin:4px 0 0;color:#fca5a5;font-size:12px;">Disaster Response Management System</p>
            </td>
          </tr>
          <!-- Alert Badge -->
          <tr>
            <td style="padding:0 40px;text-align:center;">
              <div style="display:inline-block;margin-top:-16px;background-color:#fef2f2;border:1px solid #fecaca;border-radius:20px;padding:6px 20px;">
                <span style="color:#dc2626;font-size:12px;font-weight:600;text-transform:uppercase;">Emergency Notification</span>
              </div>
            </td>
          </tr>
          <!-- Title -->
          <tr>
            <td style="padding:24px 40px 8px;text-align:center;">
              <h2 style="margin:0;color:#1a1a2e;font-size:24px;font-weight:700;line-height:1.3;">${title}</h2>
            </td>
          </tr>
          <!-- Divider -->
          <tr>
            <td style="padding:16px 40px;">
              <hr style="border:none;border-top:2px solid #e5e7eb;margin:0;" />
            </td>
          </tr>
          <!-- Message -->
          <tr>
            <td style="padding:0 40px 32px;">
              <p style="margin:0;color:#374151;font-size:16px;line-height:1.7;white-space:pre-wrap;">${message}</p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#f9fafb;padding:24px 40px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0 0 4px;color:#6b7280;font-size:12px;">
                &copy; ${new Date().getFullYear()} <a href="https://nbayeabsira.dev" style="color:#dc2626;text-decoration:none;font-weight:500;">nbayeabsira.dev</a>
              </p>
              <p style="margin:0;color:#9ca3af;font-size:11px;">
                IDRMC &mdash; Integrated Disaster Response Management System
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }
}
