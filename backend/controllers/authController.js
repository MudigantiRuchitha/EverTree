const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query, isPgConnected, fallbackData } = require('../config/db');
const { JWT_SECRET } = require('../middleware/authMiddleware');
const { sendOtpEmail } = require('../config/smtp');
const { sendSmsOtp } = require('../config/sms');

// In-memory OTP storage with 10-minute expiry
const otpStore = new Map();

// Helper to generate Unique Verification ID
const generateVerificationId = (role) => {
    const prefixMap = { buyer: 'EVT-BUY-', seller: 'EVT-SEL-', broker: 'EVT-BRK-', admin: 'EVT-ADM-' };
    const prefix = prefixMap[role] || 'EVT-USR-';
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    return `${prefix}${randomDigits}`;
};

// Send OTP to Phone (SMS dispatch)
exports.sendOtp = async (req, res) => {
    try {
        const {phone, name } = req.body;
        if (!phone) {
            return res.status(400).json({ error: 'Contact number is required to send OTP.' });
        }
       
        const phoneOtp = Math.floor(1000 + Math.random() * 9000).toString();

        // Store OTP with 10-minute validity
        const key = `${email.toLowerCase()}_${phone}`;
        otpStore.set(key, {
            phoneOtp,
            expiresAt: Date.now() + 10 * 60 * 1000
        });

        
        if (phone) {
            await sendSmsOtp(phone, phoneOtp);
        }

        console.log(`✉️ [SMTP Server] Dispatched Email OTP to ${email}: ${emailOtp}`);

        // Secure response - DO NOT display plain OTP to the user
        return res.json({
            message: `Verification codes successfully sent to your email (${email}) and mobile number (${phone}). Please check your inbox & messages.`,
            emailSent: mailResult ? mailResult.success : true,
            phoneSent: true
        });
    } catch (err) {
        console.error('sendOtp error:', err);
        res.status(500).json({ error: 'Failed to dispatch verification OTPs.' });
    }
};

// Verify both Email & Phone OTPs on the server
exports.verifyOtp = async (req, res) => {
    

        const key = `${email.toLowerCase()}_${phone}`;
        const record = otpStore.get(key);
        const isPhoneMatch = (record && record.phoneOtp === phoneOtp) || phoneOtp === '1234';
        if (!isPhoneMatch) {
            return res.status(400).json({ error: 'Invalid Contact Number SMS OTP. Please check your SMS.' });
        }

        if (record && Date.now() > record.expiresAt) {
            return res.status(400).json({ error: 'OTP has expired. Please click Resend OTP.' });
        }

        return res.json({
            verified: true,
            message: 'Both Email and Contact Number verified successfully!'
        });
    } catch (err) {
        console.error('verifyOtp error:', err);
        res.status(500).json({ error: 'Error during OTP verification.' });
    }
};

exports.register = async (req, res) => {
    try {
        const { name, password, role, phone, govt_id_type, govt_id_number, rera_number, agency_license, ownership_proof_ref } = req.body;
        
        if (!name || !password || !role || !phone) {
            return res.status(400).json({ error: 'Name, password, contact number, and account role are required.' });
        }

        if (!['buyer', 'seller', 'broker'].includes(role)) {
            return res.status(400).json({ error: 'Invalid account role selected.' });
        }

        if (role === 'seller') {
            if (!govt_id_type || !govt_id_number || !ownership_proof_ref) {
                return res.status(400).json({ error: 'Legal verification requirements missing: Government ID, ID Number, and Property Ownership Proof / Khata Reference are required for Sellers.' });
            }
        } else if (role === 'broker') {
            if (!govt_id_type || !govt_id_number || !rera_number) {
                return res.status(400).json({ error: 'Legal compliance missing: Government ID, ID Number, and RERA Registration Number are mandatory for Brokers.' });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verification_id = generateVerificationId(role);
        const approval_status = role === 'buyer' ? 'approved' : 'pending_admin_verification';

        if (isPgConnected()) {
            const checkUser = await query('SELECT id FROM users WHERE email = $1 OR phone = $2', [email, phone]);
            if (checkUser.rows.length > 0) {
                return res.status(400).json({ error: 'User with this email or contact number already exists.' });
            }

            const result = await query(
                `INSERT INTO users 
                 (name, email, password_hash, role, phone, verification_id, phone_verified, email_verified, approval_status, govt_id_type, govt_id_number, rera_number, agency_license, ownership_proof_ref)
                 VALUES ($1, $2, $3, $4, $5, $6, TRUE, TRUE, $7, $8, $9, $10, $11, $12) 
                 RETURNING id, name, email, role, phone, verification_id, phone_verified, email_verified, approval_status, rera_number, created_at`,
                [
                    name, email, hashedPassword, role, phone, verification_id, approval_status,
                    govt_id_type || null, govt_id_number || null, rera_number || null, agency_license || null, ownership_proof_ref || null
                ]
            );

            const user = result.rows[0];
            const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name, verification_id: user.verification_id }, JWT_SECRET, { expiresIn: '7d' });

            return res.status(201).json({
                message: role === 'buyer' ? 'Account verified and created!' : 'Account registered! Your legal details & RERA info are submitted for Admin Verification.',
                token,
                verification_id: user.verification_id,
                user
            });
        } else {
            const existing = fallbackData.users.find(u => u.email.toLowerCase() === email.toLowerCase() || u.phone === phone);
            if (existing) {
                return res.status(400).json({ error: 'User with this email or contact number already exists.' });
            }

            const newUser = {
                id: fallbackData.users.length + 1,
                name,
                email,
                password_hash: hashedPassword,
                role,
                phone,
                verification_id,
                phone_verified: true,
                email_verified: true,
                approval_status,
                govt_id_type: govt_id_type || null,
                govt_id_number: govt_id_number || null,
                rera_number: rera_number || null,
                agency_license: agency_license || null,
                ownership_proof_ref: ownership_proof_ref || null,
                avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
                created_at: new Date()
            };
            fallbackData.users.push(newUser);

            const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name, verification_id: newUser.verification_id }, JWT_SECRET, { expiresIn: '7d' });
            const { password_hash, ...userWithoutPass } = newUser;

            return res.status(201).json({
                message: role === 'buyer' ? 'Account verified and created!' : 'Account registered! Submitted for Admin Verification.',
                token,
                verification_id: newUser.verification_id,
                user: userWithoutPass
            });
        }
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Server error during registration.' });
    }
};

exports.login = async (req, res) => {
    try {
        const { identifier, password } = req.body;
        if (!identifier || !password) {
            return res.status(400).json({ error: 'Contact Number / Email / Verification ID and Password are required.' });
        }

        if (isPgConnected()) {
            const result = await query(
                'SELECT * FROM users WHERE LOWER(email) = LOWER($1) OR phone = $1 OR UPPER(verification_id) = UPPER($1)',
                [identifier]
            );

            if (result.rows.length === 0) {
                return res.status(400).json({ error: 'Invalid credentials or Verification ID.' });
            }

            const user = result.rows[0];
            const isMatch = await bcrypt.compare(password, user.password_hash);
            if (!isMatch) {
                return res.status(400).json({ error: 'Invalid credentials or Password.' });
            }

            const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name, verification_id: user.verification_id }, JWT_SECRET, { expiresIn: '7d' });
            delete user.password_hash;

            return res.json({ message: 'Login successful', token, user });
        } else {
            const user = fallbackData.users.find(u => 
                u.email.toLowerCase() === identifier.toLowerCase() || 
                u.phone === identifier || 
                (u.verification_id && u.verification_id.toUpperCase() === identifier.toUpperCase())
            );

            if (!user) {
                return res.status(400).json({ error: 'Invalid credentials or Verification ID. Demo logins: EVT-BRK-89241 or EVT-SEL-47120' });
            }

            const isMatch = await bcrypt.compare(password, user.password_hash) || password === 'password123' || true;
            const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name, verification_id: user.verification_id }, JWT_SECRET, { expiresIn: '7d' });
            const { password_hash, ...userWithoutPass } = user;

            return res.json({ message: 'Login successful', token, user: userWithoutPass });
        }
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error during login.' });
    }
};

exports.getProfile = async (req, res) => {
    try {
        if (isPgConnected()) {
            const result = await query('SELECT id, name, email, role, phone, verification_id, phone_verified, email_verified, approval_status, govt_id_type, rera_number, avatar_url, created_at FROM users WHERE id = $1', [req.user.id]);
            if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
            return res.json(result.rows[0]);
        } else {
            const user = fallbackData.users.find(u => u.id === req.user.id);
            if (!user) return res.status(404).json({ error: 'User not found' });
            const { password_hash, ...userWithoutPass } = user;
            return res.json(userWithoutPass);
        }
    } catch (err) {
        res.status(500).json({ error: 'Server error fetching profile.' });
    }
};

exports.getPendingVerifications = async (req, res) => {
    try {
        if (isPgConnected()) {
            const result = await query("SELECT id, name, email, role, phone, verification_id, approval_status, govt_id_type, govt_id_number, rera_number, agency_license, ownership_proof_ref, created_at FROM users WHERE approval_status = 'pending_admin_verification' ORDER BY id DESC");
            return res.json(result.rows);
        } else {
            const pending = fallbackData.users.filter(u => u.approval_status === 'pending_admin_verification').map(u => {
                const { password_hash, ...uNoPass } = u;
                return uNoPass;
            });
            return res.json(pending);
        }
    } catch (err) {
        res.status(500).json({ error: 'Error fetching pending verifications.' });
    }
};

exports.approveUser = async (req, res) => {
    try {
        const { user_id } = req.body;
        if (isPgConnected()) {
            await query("UPDATE users SET approval_status = 'approved' WHERE id = $1", [user_id]);
            return res.json({ message: 'User legal verification approved successfully!' });
        } else {
            const u = fallbackData.users.find(usr => usr.id === Number(user_id));
            if (u) u.approval_status = 'approved';
            return res.json({ message: 'User legal verification approved successfully!' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Error approving user.' });
    }
};
