const bcrypt = require('bcrypt');
const { Client } = require('pg');

async function resetAdminPassword() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'courier_service',
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Hash the new password
    const newPassword = 'Admin@123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log('Password hashed');

    // Update admin password
    const result = await client.query(
      `UPDATE users SET password = $1 WHERE email = 'sysadmin@fastx.com' RETURNING email`,
      [hashedPassword]
    );

    if (result.rowCount > 0) {
      console.log('✅ Admin password reset successfully!');
      console.log('Email: sysadmin@fastx.com');
      console.log('Password: Admin@123');
    } else {
      console.log('❌ Admin user not found');
    }

    await client.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

resetAdminPassword();
