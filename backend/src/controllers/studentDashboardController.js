import pool from "../config/db.js";

function titleCase(value) {
  return String(value || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatBookingType(value) {
  const normalized = String(value || "").toLowerCase();

  if (normalized === "view_visit") {
    return "View visit";
  }

  if (normalized === "reservation") {
    return "Reservation";
  }

  return titleCase(normalized);
}

function formatBookingStatus(value) {
  const normalized = String(value || "").toLowerCase();

  if (normalized === "pending") return "pending";
  if (normalized === "confirmed") return "confirmed";
  if (normalized === "cancelled") return "cancelled";

  return normalized || "pending";
}

async function getStudentRow(studentId) {
  if (studentId) {
    const result = await pool.query(
      `
        SELECT
          s.student_id,
          s.full_name,
          s.phone,
          s.user_id,
          u.email
        FROM students s
        LEFT JOIN users u ON u.user_id = s.user_id
        WHERE s.student_id = $1
        LIMIT 1
      `,
      [studentId]
    );

    if (result.rows[0]) {
      return result.rows[0];
    }
  }

  const fallback = await pool.query(
    `
      SELECT
        s.student_id,
        s.full_name,
        s.phone,
        s.user_id,
        u.email
      FROM students s
      LEFT JOIN users u ON u.user_id = s.user_id
      ORDER BY s.created_at ASC
      LIMIT 1
    `
  );

  return fallback.rows[0] || null;
}

export const getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.query.studentId || null;
    const student = await getStudentRow(studentId);

    if (!student) {
      return res.status(404).json({ message: "Student profile not found." });
    }

    const bookingsResult = await pool.query(
      `
        SELECT
          b.booking_id,
          b.booking_date,
          b.booking_time,
          b.type::text AS type,
          b.status::text AS status,
          b.message,
          p.property_id,
          p.title,
          p.location,
          p.price,
          p.property_type
        FROM bookings b
        JOIN properties p ON p.property_id = b.property_id
        WHERE b.student_id = $1
        ORDER BY b.created_at DESC
      `,
      [student.student_id]
    );

    const savedResult = await pool.query(
      `
        SELECT
          sp.saved_id,
          p.property_id,
          p.title,
          p.location,
          p.price,
          p.property_type,
          p.status::text AS status,
          COALESCE(r.avg_rating, 0) AS avg_rating,
          COALESCE(r.review_count, 0) AS review_count
        FROM saved_properties sp
        JOIN properties p ON p.property_id = sp.property_id
        LEFT JOIN property_ratings r ON r.property_id = p.property_id
        WHERE sp.student_id = $1
        ORDER BY sp.saved_at DESC
      `,
      [student.student_id]
    );

    return res.status(200).json({
      student: {
        studentId: student.student_id,
        userId: student.user_id,
        fullName: student.full_name,
        phone: student.phone,
        email: student.email,
      },
      bookings: bookingsResult.rows.map((booking) => ({
        id: booking.booking_id,
        property: booking.title,
        location: booking.location,
        type: formatBookingType(booking.type),
        date: booking.booking_date,
        time: booking.booking_time,
        status: formatBookingStatus(booking.status),
        message: booking.message,
      })),
      savedProperties: savedResult.rows.map((savedProperty) => ({
        id: savedProperty.property_id,
        title: savedProperty.title,
        location: savedProperty.location,
        price: Number(savedProperty.price || 0),
        propertyType: savedProperty.property_type,
        status: savedProperty.status === "available" ? "Available" : titleCase(savedProperty.status),
        rating: Number(savedProperty.avg_rating || 0),
        reviews: Number(savedProperty.review_count || 0),
      })),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Unable to load student dashboard data right now." });
  }
};