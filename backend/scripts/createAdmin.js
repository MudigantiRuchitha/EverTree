const bcrypt = require("bcrypt");
const readline = require("readline");
const { initDB, query, isPgConnected } = require("../config/db");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ask = (question) => {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
};

async function createAdmin() {
  try {
    console.log("\n🔐 EverTree Admin Account Setup\n");

    // Connect to PostgreSQL
    await initDB();

    if (!isPgConnected()) {
      console.error("\n❌ PostgreSQL is not connected.");
      console.error(
        "Please make sure PostgreSQL 16 and the EVERTREE database are running.\n"
      );
      rl.close();
      process.exit(1);
    }

    // Get admin details
    const name = await ask("Admin name: ");
    const email = await ask("Admin email: ");
    const phone = await ask("Admin phone: ");
    const password = await ask("Admin password: ");

    if (!name || !email || !phone || !password) {
      console.error(
        "\n❌ Name, email, phone and password are required."
      );
      rl.close();
      return;
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    // Generate verification ID for the admin
    const verificationId = `EVT-ADM-${Date.now()}`;

    // Check whether this email already exists
    const existingUser = await query(
      `SELECT id, role FROM users WHERE email = $1`,
      [cleanEmail]
    );

    // Hash password using bcrypt
    const passwordHash = await bcrypt.hash(password, 10);

    if (existingUser.rowCount > 0) {
      // Update existing user to Admin
      await query(
        `
        UPDATE users
        SET
          name = $1,
          phone = $2,
          verification_id = $3,
          password_hash = $4,
          role = 'admin',
          approval_status = 'approved'
        WHERE email = $5
        `,
        [
          cleanName,
          cleanPhone,
          verificationId,
          passwordHash,
          cleanEmail,
        ]
      );

      console.log("\n✅ Existing account updated as Admin.");
    } else {
      // Create new Admin
      await query(
        `
        INSERT INTO users
          (
            name,
            email,
            phone,
            verification_id,
            password_hash,
            role,
            approval_status
          )
        VALUES
          ($1, $2, $3, $4, $5, 'admin', 'approved')
        `,
        [
          cleanName,
          cleanEmail,
          cleanPhone,
          verificationId,
          passwordHash,
        ]
      );

      console.log("\n✅ New Admin account created successfully.");
    }

    console.log("\n--------------------------------");
    console.log("Admin details:");
    console.log("Name:", cleanName);
    console.log("Email:", cleanEmail);
    console.log("Phone:", cleanPhone);
    console.log("Verification ID:", verificationId);
    console.log("Role: admin");
    console.log("Approval: approved");
    console.log("--------------------------------");

    console.log("\n🔒 Password stored securely using bcrypt.");
    console.log("You can now use these credentials on the Admin Login page.\n");

    rl.close();
  } catch (error) {
    console.error("\n❌ Failed to create Admin account.");
    console.error(error.message);
    rl.close();
  }
}

createAdmin();