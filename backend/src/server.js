import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { fileURLToPath } from 'url';
import path from 'path';
import {
    getProperties,
    getStudentDashboard,
    getLandlordDashboard,
    createOrUpdateUser
} from './services/dbService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


dotenv.config({ path: path.join(__dirname, '../../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5175',
    credentials: true,
}));
app.use(express.json());


const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});


transporter.verify((error, success) => {
    if (error) {
        console.error(' SMTP Connection Failed:', error);
    } else {
        console.log(' SMTP Connection Successful!');
    }
});


app.post('/api/magic-link/send', async (req, res) => {
    console.log('========================================');
    console.log(' MAGIC LINK REQUEST RECEIVED');
    console.log(' Email:', req.body.email);
    console.log(' Role:', req.body.role);
    console.log('========================================');

    const { email, role } = req.body;

    if (!email || !role) {
        return res.status(400).json({ message: 'Email and role are required' });
    }

    try {
        
        const name = email.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        await createOrUpdateUser(email, name, '', role);

        
        const tokenData = {
            email,
            role,
            exp: Date.now() + 900000
        };
        const token = Buffer.from(JSON.stringify(tokenData)).toString('base64');
        const magicLink = `${process.env.FRONTEND_URL || 'http://localhost:5175'}/auth/callback?token=${token}`;

        console.log(' Magic Link:', magicLink);
        console.log(' Sending email to:', email);

        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || 'HomeFind SU <no-reply@example.com>',
            to: email,
            subject: ' Your HomeFind SU Magic Link',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0d8; border-radius: 12px;">
                    <h1 style="color: #185FA5; text-align: center;">🏠 HomeFind SU</h1>
                    <p style="font-size: 16px;">Hello!</p>
                    <p style="font-size: 16px;">Click the button below to sign in as <strong>${role}</strong>:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${magicLink}" style="display: inline-block; background: #185FA5; color: white; padding: 14px 40px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                            Sign In as ${role}
                        </a>
                    </div>
                    <p style="font-size: 14px; color: #666;">This link expires in <strong>15 minutes</strong>.</p>
                    <hr style="border: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #999;">If you didn't request this, you can safely ignore this email.</p>
                </div>
            `,
        });

        console.log(' Email sent successfully!');
        console.log(' Message ID:', info.messageId);
        console.log('========================================');

        res.json({
            success: true,
            message: 'Magic link sent successfully! Check your email.',
            link: magicLink
        });

    } catch (error) {
        console.error(' ERROR SENDING EMAIL:');
        console.error(' Message:', error.message);
        console.error(' Code:', error.code);
        console.log('========================================');

        res.status(500).json({
            success: false,
            message: 'Failed to send magic link. Please try again.',
            error: error.message
        });
    }
});


app.get('/api/properties', async (req, res) => {
    try {
        const properties = await getProperties();
        res.json({ properties });
    } catch (error) {
        console.error('Error fetching properties:', error);
        res.status(500).json({ message: 'Failed to fetch properties' });
    }
});


app.get('/api/student-dashboard', async (req, res) => {
    try {
        
        console.log(' Full query params:', req.query);
        
        const email = req.query.email;
        console.log('Email received:', email);
        
        if (!email) {
            console.log('No email provided in query');
            return res.status(400).json({ message: 'Email is required' });
        }

        const dashboardData = await getStudentDashboard(email);
        if (!dashboardData) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.json(dashboardData);
    } catch (error) {
        console.error('Error fetching student dashboard:', error);
        res.status(500).json({ message: 'Failed to fetch student dashboard' });
    }
});


app.get('/api/landlord-dashboard', async (req, res) => {
    try {
        const email = req.query.email;
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const dashboardData = await getLandlordDashboard(email);
        if (!dashboardData) {
            return res.status(404).json({ message: 'Landlord not found' });
        }

        res.json(dashboardData);
    } catch (error) {
        console.error('Error fetching landlord dashboard:', error);
        res.status(500).json({ message: 'Failed to fetch landlord dashboard' });
    }
});

app.listen(PORT, () => {
    console.log(` Server running on http://localhost:${PORT}`);
    console.log(` Email configured with: ${process.env.SMTP_USER}`);
});