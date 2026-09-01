const nodemailer = require('nodemailer');
require('dotenv').config();

let transporter = null;

async function getTransporter() {
    if (transporter) return transporter;

    // Check if custom SMTP variables are set in environment
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
        console.log(`✉️ Configured SMTP Transporter with Host: ${process.env.SMTP_HOST}`);
    } else {
        // Ethereal / Test SMTP fallback for instant dev testing without manual password setup
        try {
            const testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass
                }
            });
            console.log(`✉️ Ethereal Test SMTP active: ${testAccount.user}`);
        } catch (err) {
            console.warn('⚠️ SMTP initialize fallback error:', err.message);
        }
    }
    return transporter;
}

const sendOtpEmail = async (toEmail, otpCode, userName = 'Valued Member') => {
    try {
        const mailer = await getTransporter();
        if (!mailer) return null;

        const fromAddress = process.env.SMTP_FROM || '"Evertree Property Connect" <no-reply@evertree.in>';
        
        const htmlTemplate = `
            <div style="font-family: Arial, sans-serif; max-width: 540px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 28px; background-color: #ffffff;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <div style="display: inline-block; background: linear-gradient(135deg, #059669, #047857); color: #ffffff; padding: 10px 20px; border-radius: 10px; font-weight: bold; font-size: 20px;">
                        🌲 evertree.in
                    </div>
                    <p style="color: #64748b; font-size: 13px; margin-top: 6px; text-transform: uppercase; letter-spacing: 1px;">Property Connect Verification</p>
                </div>
                
                <h2 style="color: #0f172a; font-size: 18px; margin-bottom: 12px;">Hello ${userName},</h2>
                <p style="color: #475569; font-size: 14px; line-height: 1.5; margin-bottom: 20px;">
                    Thank you for joining <strong>evertree.in</strong>. Use the following One-Time Password (OTP) code to complete your Email & Phone verification:
                </p>
                
                <div style="background-color: #dcfce7; border: 2px dashed #059669; border-radius: 10px; padding: 16px; text-align: center; margin-bottom: 24px;">
                    <span style="font-size: 32px; font-weight: 800; color: #15803d; letter-spacing: 6px; font-family: monospace;">${otpCode}</span>
                </div>
                
                <p style="color: #64748b; font-size: 12px; line-height: 1.4;">
                    This OTP is valid for 10 minutes. Please do not share this code with anyone for your account security.
                </p>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0 16px 0;" />
                <div style="text-align: center; font-size: 12px; color: #94a3b8;">
                    © ${new Date().getFullYear()} evertree.in Property Connect. All rights reserved.
                </div>
            </div>
        `;

        const info = await mailer.sendMail({
            from: fromAddress,
            to: toEmail,
            subject: `🔐 ${otpCode} is your Evertree Verification OTP Code`,
            html: htmlTemplate
        });

        console.log(`✉️ SMTP Email dispatched to ${toEmail} | Message ID: ${info.messageId}`);
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
            console.log(`🔗 Ethereal SMTP Preview Link: ${previewUrl}`);
        }

        return { success: true, messageId: info.messageId, previewUrl };
    } catch (err) {
        console.error('❌ SMTP Email sending error:', err);
        return { success: false, error: err.message };
    }
};

module.exports = { getTransporter, sendOtpEmail };
