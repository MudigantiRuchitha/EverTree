const https = require('https');
require('dotenv').config();

const sendSmsOtp = async (phone, otpCode) => {
    // 1. If Twilio credentials are provided
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
        try {
            const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
            const message = await twilio.messages.create({
                body: `🌲 evertree.in: Your OTP code for account verification is ${otpCode}. Valid for 10 minutes.`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: phone.startsWith('+') ? phone : `+91${phone}`
            });
            console.log(`📱 Real Twilio SMS sent to ${phone}. Message SID: ${message.sid}`);
            return { success: true, sid: message.sid };
        } catch (err) {
            console.error('❌ Twilio SMS Error:', err.message);
        }
    }

    // 2. If Fast2SMS API Key is provided (popular in India)
    if (process.env.FAST2SMS_API_KEY) {
        return new Promise((resolve) => {
            const cleanedPhone = phone.replace(/[^0-9]/g, '').slice(-10);
            const data = JSON.stringify({
                route: 'otp',
                variables_values: otpCode,
                numbers: cleanedPhone
            });

            const options = {
                hostname: 'www.fast2sms.com',
                path: '/dev/bulkV2',
                method: 'POST',
                headers: {
                    'authorization': process.env.FAST2SMS_API_KEY,
                    'Content-Type': 'application/json',
                    'Content-Length': data.length
                }
            };

            const req = https.request(options, (res) => {
                let body = '';
                res.on('data', (d) => body += d);
                res.on('end', () => {
                    console.log(`📱 Fast2SMS Response: ${body}`);
                    resolve({ success: true, response: body });
                });
            });

            req.on('error', (e) => {
                console.error('❌ Fast2SMS Error:', e.message);
                resolve({ success: false, error: e.message });
            });

            req.write(data);
            req.end();
        });
    }

    // 3. Local Development Simulation / Terminal Log
    console.log(`\n==================================================`);
    console.log(`📱 [SMS DISPATCH GATEWAY]`);
    console.log(`👉 Recipient Phone: ${phone}`);
    console.log(`🔑 OTP Code: ${otpCode}`);
    console.log(`ℹ️ To receive real SMS on your SIM, add FAST2SMS_API_KEY or TWILIO credentials in backend/.env`);
    console.log(`==================================================\n`);
    return { success: true, simulated: true };
};

module.exports = { sendSmsOtp };
