
import pool from "../config/db.js";

function titleCase(value) {
  return String(value || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

async function getLandlordRow(landlordId) {
  if (landlordId) {
    const result = await pool.query(
      `
        SELECT
          l.landlord_id,
          l.full_name,
          l.phone,
          l.user_id,
          u.email
        FROM landlords l
        LEFT JOIN users u ON u.user_id = l.user_id
        WHERE l.landlord_id = $1
        LIMIT 1
      `,
      [landlordId]
    );

    if (result.rows[0]) {
      return result.rows[0];
    }
  }

  const fallback = await pool.query(
    `
      SELECT
        l.landlord_id,
        l.full_name,
        l.phone,
        l.user_id,
        u.email
      FROM landlords l
      LEFT JOIN users u ON u.user_id = l.user_id
      ORDER BY l.created_at ASC
      LIMIT 1
    `
  );

  return fallback.rows[0] || null;
}

export const getLandlordDashboard = async (req, res) => {
  try {
    const landlordId = req.query.landlordId || null;
    const landlord = await getLandlordRow(landlordId);

    if (!landlord) {
      return res.status(404).json({ message: "Landlord profile not found." });
    }

    const propertyResult = await pool.query(
      `
        SELECT
          p.property_id,
          p.title,
          p.location,
          p.price,
          p.property_type,
          p.status::text AS status,
          COALESCE(p.amenities, ARRAY[]::text[]) AS amenities,
          COALESCE(p.house_rules, '') AS house_rules,
          p.created_at,
          COALESCE(r.avg_rating, 0) AS avg_rating,
          COALESCE(r.review_count, 0) AS review_count
        FROM properties p
        LEFT JOIN property_ratings r ON r.property_id = p.property_id
        WHERE p.landlord_id = $1
        ORDER BY p.created_at DESC NULLS LAST, p.title ASC
      `,
      [landlord.landlord_id]
    );

    const requestResult = await pool.query(
      `
        SELECT
          b.booking_id,
          b.booking_date,
          b.booking_time,
          b.status::text AS status,
          b.message,
          b.created_at,
          s.student_id,
          s.full_name AS student_name,
          p.property_id,
          p.title,
          p.location,
          p.price
        FROM bookings b
        JOIN properties p ON p.property_id = b.property_id
        LEFT JOIN students s ON s.student_id = b.student_id
        WHERE p.landlord_id = $1
        ORDER BY b.created_at DESC NULLS LAST, b.booking_date DESC NULLS LAST, b.booking_time DESC NULLS LAST
      `,
      [landlord.landlord_id]
    );

    const statsResult = await pool.query(
      `
        SELECT
          COUNT(*)::int AS total_properties,
          COUNT(*) FILTER (WHERE p.status::text = 'pending')::int AS pending_approvals,
          COALESCE(SUM(
            (
              SELECT COUNT(*)::int
              FROM bookings b
              WHERE b.property_id = p.property_id
                AND b.status::text = 'confirmed'
            )
          ), 0)::int AS confirmed_bookings
        FROM properties p
        WHERE p.landlord_id = $1
      `,
      [landlord.landlord_id]
    );

    const properties = propertyResult.rows.map((property) => ({
      id: property.property_id,
      title: property.title,
      location: property.location,
      price: toNumber(property.price, 0),
      type: property.property_type || "",
      status: property.status || "pending",
      rating: toNumber(property.avg_rating, 0),
      reviews: toNumber(property.review_count, 0),
      amenities: Array.isArray(property.amenities) ? property.amenities : [],
      rules: property.house_rules || "",
      createdAt: property.created_at,
    }));

    const bookings = requestResult.rows.map((request) => ({
      id: request.booking_id,
      student: request.student_name || "Anonymous student",
      initials: (request.student_name || "AS")
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase() || "AS",
      property: request.title,
      date: request.booking_date,
      time: request.booking_time,
      status: request.status || "pending",
      note: request.message || "",
    }));

    const stats = statsResult.rows[0] || {
      total_properties: 0,
      pending_approvals: 0,
      confirmed_bookings: 0,
    };

    return res.status(200).json({
      landlord: {
        landlordId: landlord.landlord_id,
        userId: landlord.user_id,
        fullName: landlord.full_name,
        phone: landlord.phone,
        email: landlord.email,
      },
      stats: {
        totalProperties: toNumber(stats.total_properties, 0),
        pendingApprovals: toNumber(stats.pending_approvals, 0),
        confirmedBookings: toNumber(stats.confirmed_bookings, 0),
      },
      recentListings: properties.slice(0, 3),
      properties,
      bookings,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Unable to load landlord dashboard data right now." });
  }
};
