// Quick script to generate Ethereal test email credentials
const nodemailer = require('nodemailer');

nodemailer.createTestAccount((err, account) => {
  if (err) {
    console.error('Failed to create test account:', err);
    return;
  }

  console.log('\n✅ Test Email Account Created!\n');
  console.log('Add these to your .env file:\n');
  console.log(`EMAIL_HOST=smtp.ethereal.email`);
  console.log(`EMAIL_PORT=587`);
  console.log(`EMAIL_USER=${account.user}`);
  console.log(`EMAIL_PASSWORD=${account.pass}`);
  console.log('\nEmails will be captured at: https://ethereal.email');
  console.log(`Login with: ${account.user} / ${account.pass}\n`);
});
