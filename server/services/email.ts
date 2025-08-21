import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

const mailService = new MailService();
mailService.setApiKey(process.env.SENDGRID_API_KEY!);

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    await mailService.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

export async function sendRegistrationConfirmation(email: string, name: string, trackingNumber: string): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #2563eb, #0891b2); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">HCMS Registration Confirmation</h1>
      </div>
      
      <div style="padding: 30px; background: white; border: 1px solid #e5e7eb;">
        <h2 style="color: #1f2937; margin-bottom: 20px;">Dear ${name},</h2>
        
        <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
          Your HCMS membership application has been successfully submitted and payment has been confirmed.
        </p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #6b7280; font-size: 14px;">Your Application Tracking Number:</p>
          <h3 style="margin: 5px 0 0 0; color: #2563eb; font-family: monospace; font-size: 18px;">${trackingNumber}</h3>
        </div>
        
        <h3 style="color: #1f2937; margin-top: 30px;">What happens next?</h3>
        <ol style="color: #4b5563; line-height: 1.8;">
          <li><strong>District GS Review:</strong> Your application will be verified within 5-7 working days</li>
          <li><strong>State GS Approval:</strong> Verified applications are approved within 3-5 working days</li>
          <li><strong>ID Card Generation:</strong> You'll receive your membership ID card via email upon approval</li>
        </ol>
        
        <div style="background: #fef3c7; border: 1px solid #fbbf24; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #92400e; font-size: 14px;">
            <strong>Track Your Application:</strong> Use your tracking number to check status updates on our website.
          </p>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          For support, contact us at support@hcms.gov.in or call +91-471-xxx-xxxx
        </p>
      </div>
      
      <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px; margin: 0;">
          Healthcare Management System © 2024
        </p>
      </div>
    </div>
  `;

  return await sendEmail({
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL || 'noreply@hcms.gov.in',
    subject: 'HCMS Membership Application Confirmation',
    html,
  });
}

export async function sendApprovalNotification(email: string, name: string, membershipId: string, pdfBuffer?: Buffer): Promise<boolean> {
  const attachments = pdfBuffer ? [{
    content: pdfBuffer.toString('base64'),
    filename: 'membership-card.pdf',
    type: 'application/pdf',
    disposition: 'attachment',
  }] : [];

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #059669, #0891b2); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">🎉 Membership Approved!</h1>
      </div>
      
      <div style="padding: 30px; background: white; border: 1px solid #e5e7eb;">
        <h2 style="color: #1f2937; margin-bottom: 20px;">Congratulations ${name}!</h2>
        
        <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
          Your HCMS membership application has been approved. Welcome to the Healthcare Management System!
        </p>
        
        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #16a34a;">
          <p style="margin: 0; color: #15803d; font-size: 14px;">Your Membership ID:</p>
          <h3 style="margin: 5px 0 0 0; color: #16a34a; font-family: monospace; font-size: 18px;">${membershipId}</h3>
        </div>
        
        <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
          Your official membership ID card is attached to this email. Please keep it safe and present it when required.
        </p>
        
        <div style="background: #e0f2fe; border: 1px solid #0ea5e9; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #0c4a6e; font-size: 14px;">
            <strong>Important:</strong> Your membership is valid for one year from the date of approval. 
            Please ensure timely renewal to maintain your active status.
          </p>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          Thank you for being part of the Healthcare Management System.
        </p>
      </div>
      
      <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px; margin: 0;">
          Healthcare Management System © 2024
        </p>
      </div>
    </div>
  `;

  try {
    await mailService.send({
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@hcms.gov.in',
      subject: 'HCMS Membership Approved - ID Card Attached',
      html,
      attachments,
    });
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

export async function sendRejectionNotification(email: string, name: string, reason: string): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Application Status Update</h1>
      </div>
      
      <div style="padding: 30px; background: white; border: 1px solid #e5e7eb;">
        <h2 style="color: #1f2937; margin-bottom: 20px;">Dear ${name},</h2>
        
        <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
          We regret to inform you that your HCMS membership application could not be approved at this time.
        </p>
        
        <div style="background: #fef2f2; border: 1px solid #fca5a5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0; color: #991b1b; font-weight: bold;">Reason for rejection:</p>
          <p style="margin: 0; color: #7f1d1d;">${reason}</p>
        </div>
        
        <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
          You may submit a new application after addressing the concerns mentioned above. 
          Please ensure all required documents and information are accurate and complete.
        </p>
        
        <div style="background: #eff6ff; border: 1px solid #3b82f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #1e40af; font-size: 14px;">
            <strong>Need Help?</strong> Contact our support team for guidance on reapplying.
          </p>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          For support, contact us at support@hcms.gov.in or call +91-471-xxx-xxxx
        </p>
      </div>
      
      <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px; margin: 0;">
          Healthcare Management System © 2024
        </p>
      </div>
    </div>
  `;

  return await sendEmail({
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL || 'noreply@hcms.gov.in',
    subject: 'HCMS Membership Application - Action Required',
    html,
  });
}
