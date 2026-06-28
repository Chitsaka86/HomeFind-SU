
import pool from '../config/db.js';


export async function getUserByEmail(email) {
    const result = await pool.query(
        `SELECT 
            u.*,
            s.full_name as student_name,
            s.phone as student_phone,
            l.full_name as landlord_name,
            l.phone as landlord_phone,
            l.is_verified
         FROM users u
         LEFT JOIN students s ON u.user_id = s.user_id
         LEFT JOIN landlords l ON u.user_id = l.user_id
         WHERE u.email = $1`,
        [email]
    );
    return result.rows[0];
}

export async function createOrUpdateUser(email, fullName, phone, role) {
    
    const userResult = await pool.query(
        `INSERT INTO users (email, role) 
         VALUES ($1, $2) 
         ON CONFLICT (email) DO UPDATE SET 
            role = EXCLUDED.role,
            updated_at = NOW()
         RETURNING *`,
        [email, role]
    );
    
    const user = userResult.rows[0];
    
    
    if (role === 'student') {
        await pool.query(
            `INSERT INTO students (user_id, full_name, phone) 
             VALUES ($1, $2, $3) 
             ON CONFLICT (user_id) DO UPDATE SET 
                full_name = EXCLUDED.full_name,
                phone = EXCLUDED.phone,
                updated_at = NOW()`,
            [user.user_id, fullName, phone || '']
        );
    } else if (role === 'landlord') {
        await pool.query(
            `INSERT INTO landlords (user_id, full_name, phone) 
             VALUES ($1, $2, $3) 
             ON CONFLICT (user_id) DO UPDATE SET 
                full_name = EXCLUDED.full_name,
                phone = EXCLUDED.phone,
                updated_at = NOW()`,
            [user.user_id, fullName, phone || '']
        );
    }
    
    return user;
}

export async function getUserById(userId) {
    const result = await pool.query(
        `SELECT 
            u.*,
            s.full_name as student_name,
            s.phone as student_phone,
            l.full_name as landlord_name,
            l.phone as landlord_phone,
            l.is_verified
         FROM users u
         LEFT JOIN students s ON u.user_id = s.user_id
         LEFT JOIN landlords l ON u.user_id = l.user_id
         WHERE u.user_id = $1`,
        [userId]
    );
    return result.rows[0];
}

export async function getProperties() {
    try {
    const result = await pool.query(`
        SELECT 
            p.property_id as id,
            p.title,
            p.description,
            p.location,
            p.latitude,
            p.longitude,
            p.price,
            p.property_type as type,
            p.amenities,
            p.house_rules as rules,
            p.status,
            p.created_at,
            l.full_name as landlord_name,
            l.phone as landlord_phone,
            l.is_verified as landlord_verified,
            COALESCE(AVG(r.overall_rating), 0) as avg_rating,
            COUNT(DISTINCT r.review_id) as reviews_count
        FROM properties p
        JOIN landlords l ON p.landlord_id = l.landlord_id
        LEFT JOIN reviews r ON p.property_id = r.property_id
        GROUP BY p.property_id, l.landlord_id, l.full_name, l.phone, l.is_verified
        ORDER BY p.created_at DESC
    `);
    if (result.rows.length === 0) {
            console.log('No properties found in database');
            return [];
    }
    
    return result.rows.map(row => ({
        id: row.property_id,
        title: row.title,
        description: row.description,
        location: row.location,
        latitude: parseFloat(row.latitude),
        longitude: parseFloat(row.longitude),
        price: parseFloat(row.price),
        type: row.property_type,
        status: row.status,
        amenities: row.amenities || [],
        rules: row.house_rules,
        rating: parseFloat(row.avg_rating) || 0,
        reviews: parseInt(row.reviews_count) || 0,
        distance: 1.2, 
        landlord: {
            name: row.landlord_name || 'Unknown',
            phone: row.landlord_phone,
            verified: row.landlord_verified || false
        },
        images: [],
        reviewList: []
    }));
    } catch (error) {
        console.error(' Error fetching properties:', error);
        return []; 
}
}

export async function getPropertyById(propertyId) {
    const result = await pool.query(`
        SELECT 
            p.*,
            l.full_name as landlord_name,
            l.phone as landlord_phone,
            l.is_verified as landlord_verified,
            COALESCE(AVG(r.overall_rating), 0) as avg_rating,
            COUNT(DISTINCT r.review_id) as reviews_count,
            json_agg(DISTINCT pi.*) as images,
            json_agg(DISTINCT r.*) as reviews
        FROM properties p
        JOIN landlords l ON p.landlord_id = l.landlord_id
        LEFT JOIN reviews r ON p.property_id = r.property_id
        LEFT JOIN property_images pi ON p.property_id = pi.property_id
        WHERE p.property_id = $1
        GROUP BY p.property_id, l.landlord_id, l.full_name, l.phone, l.is_verified
    `, [propertyId]);
    
    return result.rows[0];
}


export async function getStudentDashboard(email) {
    
    const user = await getUserByEmail(email);
    if (!user) return null;
    
    
    const studentResult = await pool.query(
        `SELECT * FROM students WHERE user_id = $1`,
        [user.user_id]
    );
    const student = studentResult.rows[0];
    if (!student) return null;
    
    
    const bookingsResult = await pool.query(`
        SELECT 
            b.*,
            p.title as property_title,
            p.location as property_location,
            p.price as property_price
        FROM bookings b
        JOIN properties p ON b.property_id = p.property_id
        WHERE b.student_id = $1
        ORDER BY b.booking_date DESC
    `, [student.student_id]);
    
    
    const savedResult = await pool.query(`
        SELECT 
            p.property_id as id,
            p.title,
            p.price,
            p.location
        FROM saved_properties sp
        JOIN properties p ON sp.property_id = p.property_id
        WHERE sp.student_id = $1
    `, [student.student_id]);
    
    return {
        student: {
            fullName: student.full_name,
            email: user.email,
            phone: student.phone || '',
            userId: user.user_id
        },
        bookings: bookingsResult.rows.map(row => ({
            id: row.booking_id,
            property: row.property_title,
            type: row.type,
            date: row.booking_date,
            time: row.booking_time,
            status: row.status,
            message: row.message || ''
        })),
        savedProperties: savedResult.rows.map(row => ({
            id: row.id,
            title: row.title,
            price: parseFloat(row.price),
            location: row.location
        }))
    };
}


export async function getLandlordDashboard(email) {
    
    const user = await getUserByEmail(email);
    if (!user) return null;
    
    
    const landlordResult = await pool.query(
        `SELECT * FROM landlords WHERE user_id = $1`,
        [user.user_id]
    );
    const landlord = landlordResult.rows[0];
    if (!landlord) return null;
    
    
    const propertiesResult = await pool.query(`
        SELECT 
            p.*,
            COALESCE(AVG(r.overall_rating), 0) as avg_rating,
            COUNT(DISTINCT r.review_id) as reviews_count
        FROM properties p
        LEFT JOIN reviews r ON p.property_id = r.property_id
        WHERE p.landlord_id = $1
        GROUP BY p.property_id
        ORDER BY p.created_at DESC
    `, [landlord.landlord_id]);
    
    
    const bookingsResult = await pool.query(`
        SELECT 
            b.*,
            s.full_name as student_name,
            p.title as property_title,
            u.email as student_email
        FROM bookings b
        JOIN properties p ON b.property_id = p.property_id
        JOIN students s ON b.student_id = s.student_id
        JOIN users u ON s.user_id = u.user_id
        WHERE p.landlord_id = $1
        ORDER BY b.created_at DESC
    `, [landlord.landlord_id]);
    
    const properties = propertiesResult.rows.map(row => ({
        id: row.property_id,
        title: row.title,
        location: row.location,
        price: parseFloat(row.price),
        type: row.property_type,
        status: row.status,
        amenities: row.amenities || [],
        rules: row.house_rules,
        rating: parseFloat(row.avg_rating) || 0,
        reviews: parseInt(row.reviews_count) || 0
    }));
    
    const stats = {
        totalProperties: properties.length,
        pendingApprovals: properties.filter(p => p.status === 'pending' || p.status === 'approved').length,
        confirmedBookings: bookingsResult.rows.filter(b => b.status === 'confirmed').length
    };
    
    return {
        landlord: {
            fullName: landlord.full_name,
            email: user.email,
            phone: landlord.phone || '',
            isVerified: landlord.is_verified
        },
        stats,
        recentListings: properties.slice(0, 2),
        properties,
        bookings: bookingsResult.rows.map(row => ({
            id: row.booking_id,
            student: row.student_name,
            initials: row.student_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'ST',
            property: row.property_title,
            date: row.booking_date,
            time: row.booking_time,
            status: row.status,
            note: row.message || ''
        }))
    };
}


export async function createBooking(studentEmail, propertyId, bookingDate, bookingTime, type, message) {
    
    const user = await getUserByEmail(studentEmail);
    if (!user) throw new Error('User not found');
    
    const studentResult = await pool.query(
        'SELECT student_id FROM students WHERE user_id = $1',
        [user.user_id]
    );
    const student = studentResult.rows[0];
    if (!student) throw new Error('Student profile not found');
    
    const result = await pool.query(
        `INSERT INTO bookings (student_id, property_id, booking_date, booking_time, type, message)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [student.student_id, propertyId, bookingDate, bookingTime, type, message || '']
    );
    
    return result.rows[0];
}


export async function saveProperty(studentEmail, propertyId) {
    const user = await getUserByEmail(studentEmail);
    if (!user) throw new Error('User not found');
    
    const studentResult = await pool.query(
        'SELECT student_id FROM students WHERE user_id = $1',
        [user.user_id]
    );
    const student = studentResult.rows[0];
    if (!student) throw new Error('Student profile not found');
    
    const result = await pool.query(
        `INSERT INTO saved_properties (student_id, property_id)
         VALUES ($1, $2)
         ON CONFLICT (student_id, property_id) DO NOTHING
         RETURNING *`,
        [student.student_id, propertyId]
    );
    
    return result.rows[0];
}

export async function unsaveProperty(studentEmail, propertyId) {
    const user = await getUserByEmail(studentEmail);
    if (!user) throw new Error('User not found');
    
    const studentResult = await pool.query(
        'SELECT student_id FROM students WHERE user_id = $1',
        [user.user_id]
    );
    const student = studentResult.rows[0];
    if (!student) throw new Error('Student profile not found');
    
    const result = await pool.query(
        `DELETE FROM saved_properties
         WHERE student_id = $1 AND property_id = $2
         RETURNING *`,
        [student.student_id, propertyId]
    );
    
    return result.rows[0];
}
