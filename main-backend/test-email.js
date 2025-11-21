import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const configs = [
  {
    name: 'Port 587 with STARTTLS',
    config: {
      host: process.env.EMAIL_HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      tls: {
        rejectUnauthorized: false
      }
    }
  },
  {
    name: 'Port 465 with SSL',
    config: {
      host: process.env.EMAIL_HOST,
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      tls: {
        rejectUnauthorized: false
      }
    }
  },
  {
    name: 'Port 25 (no encryption)',
    config: {
      host: process.env.EMAIL_HOST,
      port: 25,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      tls: {
        rejectUnauthorized: false
      }
    }
  }
];

async function testConfig(name, config) {
  console.log(`\n🧪 Testing: ${name}`);
  console.log('---');
  
  const transporter = nodemailer.createTransport({
    ...config,
    connectionTimeout: 5000,
    greetingTimeout: 5000
  });

  try {
    await transporter.verify();
    console.log(`✅ ${name} - SUCCESS!`);
    return true;
  } catch (error) {
    console.log(`❌ ${name} - FAILED: ${error.message}`);
    return false;
  }
}

async function testAll() {
  console.log('Testing email configuration...');
  console.log('Host:', process.env.EMAIL_HOST);
  console.log('User:', process.env.EMAIL_USER);
  console.log('========================');

  for (const { name, config } of configs) {
    const success = await testConfig(name, config);
    if (success) {
      console.log('\n✅ Working configuration found!');
      console.log('Update your .env with:');
      console.log(`EMAIL_PORT=${config.port}`);
      break;
    }
  }
  
  console.log('\n========================');
  console.log('If all failed, check:');
  console.log('1. Firewall blocking outbound SMTP');
  console.log('2. SMTP server address correct');
  console.log('3. Credentials correct');
  console.log('4. Server allows external connections');
}

testAll();