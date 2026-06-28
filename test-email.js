import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

console.log('SMTP Config:');
console.log('Host:', process.env.SMTP_HOST);
console.log('Port:', process.env.SMTP_PORT);
console.log('User:', process.env.SMTP_USER);
console.log('Pass:', process.env.SMTP_PASS ? '********' : 'MISSING');

transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP Connection Failed:', error);
  } else {
    console.log('✅ SMTP Connection Successful!');
    
    // Try sending a test email
    transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: 'michellechitsaka6@gmail.com',
      subject: 'Test Email from HomeFind SU',
      text: 'This is a test email from your application!',
    })
    .then(info => {
      console.log('✅ Test email sent!');
      console.log('Message ID:', info.messageId);
    })
    .catch(err => {
      console.error('❌ Failed to send test email:', err.message);
    });
  }
});
