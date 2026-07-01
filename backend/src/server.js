import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { fileURLToPath } from 'url';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import {
    getProperties,
    getStudentDashboard,
    getLandlordDashboard,
    createOrUpdateUser
} from './services/dbService.js';
import pool from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


dotenv.config({ path: path.join(__dirname, '../../.env') });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('Cloudinary configured with cloud name:', process.env.CLOUDINARY_CLOUD_NAME);

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5175',
    credentials: true,
}));


app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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
        console.error('SMTP Connection Failed:', error);
    } else {
        console.log('SMTP Connection Successful!');
    }
});


app.post('/api/upload-image', async (req, res) => {
  try {
    const { image } = req.body;
    
    if (!image) {
      return res.status(400).json({ 
        success: false, 
        message: 'No image provided' 
      });
    }

    console.log('📤 Uploading image to Cloudinary...');
    
    const result = await cloudinary.uploader.upload(image, {
      folder: 'homefind-properties',
      transformation: [
        { width: 600, height: 600, crop: 'limit' },
        { quality: 'auto' }
      ]
    });

    console.log('Image uploaded to Cloudinary:', result.secure_url);

    res.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to upload image',
      error: error.message 
    });
  }
});

app.post('/api/magic-link/send', async (req, res) => {
    console.log('========================================');
    console.log('MAGIC LINK REQUEST RECEIVED');
    console.log('Email:', req.body.email);
    console.log('Role:', req.body.role);
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

        console.log('🔗 Magic Link:', magicLink);
        console.log('Sending email to:', email);

        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || 'HomeFind SU <no-reply@example.com>',
            to: email,
            subject: 'Your HomeFind SU Magic Link',
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

        console.log('Email sent successfully!');
        console.log('Message ID:', info.messageId);
        console.log('========================================');

        res.json({
            success: true,
            message: 'Magic link sent successfully! Check your email.',
            link: magicLink
        });

    } catch (error) {
        console.error('ERROR SENDING EMAIL:');
        console.error('Message:', error.message);
        console.error('Code:', error.code);
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
        console.log('🔍 Fetching properties...');
        
        const query = `
            SELECT 
                p.property_id,
                p.landlord_id,
                p.title,
                p.location,
                p.price,
                p.property_type,
                p.amenities,
                p.house_rules,
                p.status,
                p.latitude,
                p.longitude,
                p.created_at,
                l.full_name as landlord_name
            FROM properties p
            LEFT JOIN landlords l ON l.landlord_id = p.landlord_id
            ORDER BY p.created_at DESC
            LIMIT 50
        `;
        
        const result = await pool.query(query);
        console.log(`📊 Found ${result.rows.length} properties`);
        
        const properties = [];
        
        for (const row of result.rows) {
            // Get images
            let images = [];
            try {
                const imagesResult = await pool.query(
                    `SELECT url, caption, sort_order 
                     FROM property_images 
                     WHERE property_id = $1 
                     ORDER BY sort_order NULLS LAST, uploaded_at ASC`,
                    [row.property_id]
                );
                images = imagesResult.rows.map(img => ({
                    url: img.url,
                    caption: img.caption || '',
                    sortOrder: img.sort_order || 0
                }));
            } catch (e) {
                console.log('Images table might not exist yet');
            }
            
            
            let distance = 0;
            if (row.latitude && row.longitude) {
                const latDiff = parseFloat(row.latitude) - (-1.2965);
                const lngDiff = parseFloat(row.longitude) - 36.7802;
                distance = Math.round(Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111);
            }
            
            properties.push({
                id: row.property_id,
                title: row.title || 'Property',
                location: row.location || 'Unknown',
                latitude: row.latitude == null ? null : parseFloat(row.latitude),
                longitude: row.longitude == null ? null : parseFloat(row.longitude),
                distance: distance,
                price: parseFloat(row.price) || 0,
                status: row.status || 'available',
                rating: 0,
                reviews: 0,
                amenities: Array.isArray(row.amenities) ? row.amenities : [],
                rules: row.house_rules || "",
                landlord: {
                    name: row.landlord_name || 'Unknown landlord',
                    listings: 0,
                },
                reviewList: [],
                propertyType: row.property_type || "",
                images: images,
            });
        }

        console.log(`Returning ${properties.length} properties`);
        res.json({ properties });
        
    } catch (error) {
        console.error('Error in getProperties:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ 
            message: "Unable to load properties right now.",
            error: error.message
        });
    }
});
app.delete('/api/properties/:propertyId', async (req, res) => {
    try {
        const { propertyId } = req.params;
        const userEmail = req.headers['x-user-email'];
        
        console.log(`Deleting property ${propertyId}`);
        
      
        if (userEmail) {
            const user = await pool.query(
                'SELECT user_id FROM users WHERE email = $1',
                [userEmail]
            );
            
            if (user.rows.length > 0) {
                const landlord = await pool.query(
                    'SELECT landlord_id FROM landlords WHERE user_id = $1',
                    [user.rows[0].user_id]
                );
                
                if (landlord.rows.length > 0) {
                    const propertyCheck = await pool.query(
                        'SELECT property_id FROM properties WHERE property_id = $1 AND landlord_id = $2',
                        [propertyId, landlord.rows[0].landlord_id]
                    );
                    
                    if (propertyCheck.rows.length === 0) {
                        return res.status(403).json({ 
                            success: false, 
                            message: 'You do not own this property' 
                        });
                    }
                }
            }
        }
        
        
        const result = await pool.query(
            'DELETE FROM properties WHERE property_id = $1 RETURNING property_id',
            [propertyId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Property not found' 
            });
        }
        
        console.log(` Property ${propertyId} deleted successfully`);
        
        res.json({
            success: true,
            message: 'Property deleted successfully',
            propertyId: propertyId
        });
        
    } catch (error) {
        console.error('Error deleting property:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to delete property',
            error: error.message 
        });
    }
});


app.post('/api/properties', async (req, res) => {
    try {
        console.log('📤 Received property data:', JSON.stringify(req.body, null, 2));
        
        const {
            title,
            location,
            locationLat,
            locationLng,
            price,
            type,
            status,
            description,
            amenities,
            rules,
            images
        } = req.body;

        if (!title || !location || !price || !description) {
            return res.status(400).json({ 
                message: 'Title, location, price, and description are required' 
            });
        }

        const userEmail = req.headers['x-user-email'];
        let landlordId;

        if (userEmail) {
            const user = await pool.query(
                'SELECT user_id FROM users WHERE email = $1',
                [userEmail]
            );
            
            if (user.rows.length > 0) {
                const landlord = await pool.query(
                    'SELECT landlord_id FROM landlords WHERE user_id = $1',
                    [user.rows[0].user_id]
                );
                
                if (landlord.rows.length > 0) {
                    landlordId = landlord.rows[0].landlord_id;
                }
            }
        }

        if (!landlordId) {
            const defaultLandlord = await pool.query(
                'SELECT landlord_id FROM landlords LIMIT 1'
            );
            if (defaultLandlord.rows.length === 0) {
                return res.status(400).json({ 
                    message: 'No landlord found. Please create a landlord account first.' 
                });
            }
            landlordId = defaultLandlord.rows[0].landlord_id;
        }

        console.log('👤 Using landlord_id:', landlordId);

        const result = await pool.query(
            `INSERT INTO properties (
                landlord_id, 
                title, 
                description, 
                location, 
                latitude, 
                longitude, 
                price, 
                property_type, 
                status, 
                house_rules, 
                amenities
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING property_id`,
            [
                landlordId,
                title,
                description,
                location,
                locationLat || null,
                locationLng || null,
                parseFloat(price),
                type || 'Bedsitter',
                'pending',
                rules || '',
                amenities || []
            ]
        );

        const propertyId = result.rows[0].property_id;
        console.log('Property created with ID:', propertyId);

        let imagesInserted = 0;
        if (images && Array.isArray(images) && images.length > 0) {
            console.log(`Inserting ${images.length} images`);
            
            for (let i = 0; i < images.length; i++) {
                const image = images[i];
                let imageUrl = null;
                let caption = '';
                let sortOrder = i;
                
                if (typeof image === 'string') {
                    imageUrl = image;
                } else if (image && typeof image === 'object') {
                    if (image.url) {
                        imageUrl = image.url;
                    } else if (image.secure_url) {
                        imageUrl = image.secure_url;
                    }
                    caption = image.caption || image.name || '';
                }
                
                if (imageUrl) {
                    try {
                        await pool.query(
                            `INSERT INTO property_images (property_id, url, caption, sort_order)
                             VALUES ($1, $2, $3, $4)`,
                            [propertyId, imageUrl, caption, sortOrder]
                        );
                        imagesInserted++;
                    } catch (imageError) {
                        console.error(`Error inserting image ${i + 1}:`, imageError.message);
                    }
                }
            }
            console.log(`Inserted ${imagesInserted} images`);
        }

        res.status(201).json({
            success: true,
            message: 'Property created successfully',
            propertyId: propertyId,
            imageCount: imagesInserted
        });

    } catch (error) {
        console.error('Error creating property:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to create property', 
            error: error.message 
        });
    }
});


app.put('/api/bookings/:bookingId', async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { status } = req.body;
        const userEmail = req.headers['x-user-email'];
        
        console.log(` Updating booking ${bookingId} to status: ${status}`);
        
        if (!status) {
            return res.status(400).json({ 
                success: false, 
                message: 'Status is required' 
            });
        }
        
        if (userEmail) {
            const user = await pool.query(
                'SELECT user_id FROM users WHERE email = $1',
                [userEmail]
            );
            
            if (user.rows.length === 0) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'User not found' 
                });
            }
            
            const landlord = await pool.query(
                'SELECT landlord_id FROM landlords WHERE user_id = $1',
                [user.rows[0].user_id]
            );
            
            if (landlord.rows.length === 0) {
                return res.status(403).json({ 
                    success: false, 
                    message: 'You are not a landlord' 
                });
            }
            
            const bookingCheck = await pool.query(
                `SELECT b.booking_id 
                 FROM bookings b
                 JOIN properties p ON b.property_id = p.property_id
                 WHERE b.booking_id = $1 AND p.landlord_id = $2`,
                [bookingId, landlord.rows[0].landlord_id]
            );
            
            if (bookingCheck.rows.length === 0) {
                return res.status(403).json({ 
                    success: false, 
                    message: 'You do not own the property for this booking' 
                });
            }
        }
        
        const result = await pool.query(
            `UPDATE bookings 
             SET status = $1, updated_at = NOW() 
             WHERE booking_id = $2 
             RETURNING *`,
            [status, bookingId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Booking not found' 
            });
        }
        
        console.log(`Booking ${bookingId} updated to ${status}`);
        
        res.json({
            success: true,
            message: 'Booking updated successfully',
            booking: result.rows[0]
        });
        
    } catch (error) {
        console.error('Error updating booking:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to update booking',
            error: error.message 
        });
    }
});


app.post('/api/bookings', async (req, res) => {
    try {
        const { propertyId, bookingDate, bookingTime, type, message } = req.body;
        const userEmail = req.headers['x-user-email'];
        
        if (!userEmail) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        if (!propertyId || !bookingDate || !bookingTime) {
            return res.status(400).json({ message: 'Please provide a property, date, and time.' });
        }

       
        const user = await pool.query(
            'SELECT user_id FROM users WHERE email = $1',
            [userEmail]
        );
        
        if (user.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        const student = await pool.query(
            'SELECT student_id FROM students WHERE user_id = $1',
            [user.rows[0].user_id]
        );
        
        if (student.rows.length === 0) {
            return res.status(404).json({ message: 'Student profile not found' });
        }

        const result = await pool.query(
            `INSERT INTO bookings (student_id, property_id, booking_date, booking_time, type, message, status)
             VALUES ($1, $2, $3, $4, $5, $6, 'pending')
             RETURNING *`,
            [student.rows[0].student_id, propertyId, bookingDate, bookingTime, type || 'viewing', message || '']
        );

        res.status(201).json({
            success: true,
            message: 'Booking request created successfully',
            booking: result.rows[0],
        });
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ message: 'Failed to create booking request' });
    }
});


app.get('/api/student-dashboard', async (req, res) => {
    try {
        console.log('Full query params:', req.query);
        
        const email = req.query.email;
        console.log('Email received:', email);
        
        if (!email) {
            console.log(' No email provided in query');
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
        console.log('Landlord dashboard requested for:', email);
        
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


const isValidUuid = (value) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

const ensureStudentContext = async (userEmail) => {
  const normalizedName = (userEmail || 'Student')
    .split('@')[0]
    .replace(/[._]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

  const existingUser = await pool.query(
    'SELECT user_id FROM users WHERE email = $1',
    [userEmail]
  );

  let userId;
  if (existingUser.rows.length === 0) {
    const createdUser = await createOrUpdateUser(userEmail, normalizedName, '', 'student');
    userId = createdUser?.user_id;
  } else {
    userId = existingUser.rows[0].user_id;
    await createOrUpdateUser(userEmail, normalizedName, '', 'student');
  }

  if (!userId) {
    throw new Error('Unable to create student profile');
  }

  const studentResult = await pool.query(
    'SELECT student_id FROM students WHERE user_id = $1',
    [userId]
  );

  if (studentResult.rows.length === 0) {
    const createdStudent = await pool.query(
      'INSERT INTO students (user_id, full_name, phone) VALUES ($1, $2, $3) RETURNING student_id',
      [userId, normalizedName, '']
    );
    return createdStudent.rows[0].student_id;
  }

  return studentResult.rows[0].student_id;
};

app.post('/api/saved-properties', async (req, res) => {
  try {
    const { propertyId } = req.body;
    const userEmail = req.headers['x-user-email'];
    const normalizedPropertyId = String(propertyId ?? '').trim();
    
    if (!userEmail) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!normalizedPropertyId) {
      return res.status(400).json({ message: 'Property id is required' });
    }

    if (!isValidUuid(normalizedPropertyId)) {
      return res.status(400).json({ message: 'Property id is invalid' });
    }

    const studentId = await ensureStudentContext(userEmail);

    const existing = await pool.query(
      'SELECT * FROM saved_properties WHERE student_id = $1 AND property_id = $2',
      [studentId, normalizedPropertyId]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Property already saved' });
    }

    await pool.query(
      'INSERT INTO saved_properties (student_id, property_id) VALUES ($1, $2)',
      [studentId, normalizedPropertyId]
    );

    res.status(201).json({ 
      success: true, 
      message: 'Property saved successfully' 
    });
  } catch (error) {
    console.error('Error saving property:', error);
    res.status(500).json({ message: 'Failed to save property' });
  }
});

app.delete('/api/saved-properties/:propertyId', async (req, res) => {
  try {
    const { propertyId } = req.params;
    const userEmail = req.headers['x-user-email'];
    const normalizedPropertyId = String(propertyId ?? '').trim();
    
    if (!userEmail) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!normalizedPropertyId) {
      return res.status(400).json({ message: 'Property id is required' });
    }

    if (!isValidUuid(normalizedPropertyId)) {
      return res.status(400).json({ message: 'Property id is invalid' });
    }

    const studentId = await ensureStudentContext(userEmail);

    await pool.query(
      'DELETE FROM saved_properties WHERE student_id = $1 AND property_id = $2',
      [studentId, normalizedPropertyId]
    );

    res.json({ success: true, message: 'Property unsaved successfully' });
  } catch (error) {
    console.error('Error unsaving property:', error);
    res.status(500).json({ message: 'Failed to unsave property' });
  }
});

app.get('/api/saved-properties/:propertyId/check', async (req, res) => {
  try {
    const { propertyId } = req.params;
    const userEmail = req.headers['x-user-email'];
    const normalizedPropertyId = String(propertyId ?? '').trim();
    
    if (!userEmail) {
      return res.json({ saved: false });
    }

    if (!normalizedPropertyId) {
      return res.json({ saved: false });
    }

    if (!isValidUuid(normalizedPropertyId)) {
      return res.json({ saved: false });
    }

    const studentId = await ensureStudentContext(userEmail);

    const result = await pool.query(
      'SELECT * FROM saved_properties WHERE student_id = $1 AND property_id = $2',
      [studentId, normalizedPropertyId]
    );

    res.json({ saved: result.rows.length > 0 });
  } catch (error) {
    console.error('Error checking saved status:', error);
    res.json({ saved: false });
  }
});


app.get('/api/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW() as current_time');
        res.json({
            success: true,
            message: 'Database connected!',
            time: result.rows[0].current_time
        });
    } catch (error) {
        console.error('Database test failed:', error);
        res.status(500).json({
            success: false,
            message: 'Database connection failed',
            error: error.message
        });
    }
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Email configured with: ${process.env.SMTP_USER}`);
});