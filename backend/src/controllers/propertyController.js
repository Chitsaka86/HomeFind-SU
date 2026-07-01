import pool from "../config/db.js";

const STRATHMORE_LATITUDE = -1.2965;
const STRATHMORE_LONGITUDE = 36.7802;

function toNumber(value, fallback = 0) {
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeStatus(status) {
	const normalized = String(status || "").toLowerCase();

	if (normalized === "available") {
		return "Available";
	}

	if (normalized === "booked") {
		return "Booked";
	}

	if (!normalized) {
		return "Available";
	}

	return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export const getProperties = async (_req, res) => {
	try {
		const query = `
			WITH landlord_counts AS (
				SELECT landlord_id, COUNT(*)::int AS listings
				FROM properties
				GROUP BY landlord_id
			),
			base AS (
				SELECT
					p.property_id,
					p.title,
					p.location,
					p.price,
					p.property_type,
					COALESCE(p.amenities, ARRAY[]::text[]) AS amenities,
					COALESCE(p.house_rules, '') AS house_rules,
					p.status::text AS status,
					p.latitude,
					p.longitude,
					COALESCE(l.full_name, d.landlord_name, 'Unknown landlord') AS landlord_name,
					COALESCE(lc.listings, 0) AS landlord_listings,
					COALESCE(r.avg_rating, 0) AS avg_rating,
					COALESCE(r.review_count, 0) AS review_count,
					COALESCE(img.images, '[]'::json) AS images,
					p.created_at,
					CASE
						WHEN p.latitude IS NOT NULL AND p.longitude IS NOT NULL THEN
							ROUND(
								(
									6371 * ACOS(
										LEAST(
											1,
											GREATEST(
												-1,
												COS(RADIANS($1::numeric)) * COS(RADIANS(p.latitude::numeric)) * COS(RADIANS(p.longitude::numeric) - RADIANS($2::numeric))
												+ SIN(RADIANS($1::numeric)) * SIN(RADIANS(p.latitude::numeric))
											)
										)
									)
								)::numeric,
								1
							)
						ELSE NULL
					END AS distance_km
				FROM properties p
				LEFT JOIN landlords l ON l.landlord_id = p.landlord_id
				LEFT JOIN property_details d ON d.property_id = p.property_id
				LEFT JOIN property_ratings r ON r.property_id = p.property_id
				LEFT JOIN landlord_counts lc ON lc.landlord_id = p.landlord_id
				LEFT JOIN LATERAL (
					SELECT json_agg(
						json_build_object(
							'url', pi.url,
							'caption', pi.caption,
							'sortOrder', pi.sort_order
						)
						ORDER BY pi.sort_order NULLS LAST, pi.uploaded_at ASC
					) AS images
					FROM property_images pi
					WHERE pi.property_id = p.property_id
				) img ON true
			)
			SELECT
				b.*,
				COALESCE(rv.review_list, '[]'::json) AS review_list
			FROM base b
			LEFT JOIN LATERAL (
				SELECT json_agg(
					json_build_object(
						'name', COALESCE(s.full_name, 'Anonymous'),
						'date', to_char(rv.created_at, 'FMMonth YYYY'),
						'rating', COALESCE(rv.overall_rating, 0),
						'comment', COALESCE(rv.comment, '')
					) ORDER BY rv.created_at DESC
				) AS review_list
				FROM reviews rv
				LEFT JOIN students s ON s.student_id = rv.student_id
				WHERE rv.property_id = b.property_id
			) rv ON true
			ORDER BY b.created_at DESC NULLS LAST, b.title ASC
		`;

		const result = await pool.query(query, [STRATHMORE_LATITUDE, STRATHMORE_LONGITUDE]);

		const properties = result.rows.map((row) => ({
			id: row.property_id,
			title: row.title,
			location: row.location,
			latitude: row.latitude == null ? null : Number(row.latitude),
			longitude: row.longitude == null ? null : Number(row.longitude),
			distance: toNumber(row.distance_km, 0),
			price: toNumber(row.price, 0),
			status: normalizeStatus(row.status),
			rating: toNumber(row.avg_rating, 0),
			reviews: toNumber(row.review_count, 0),
			amenities: Array.isArray(row.amenities) ? row.amenities : [],
			rules: row.house_rules || "",
			landlord: {
				name: row.landlord_name || "Unknown landlord",
				listings: toNumber(row.landlord_listings, 0),
			},
			reviewList: Array.isArray(row.review_list) ? row.review_list : [],
			imageUrl: row.image_url || "",
			propertyType: row.property_type || "",
			images: Array.isArray(row.images)
				? row.images
					.filter((image) => image && typeof image === 'object' && image.url)
					.map((image) => ({
						url: image.url,
						caption: image.caption || '',
						sortOrder: image.sortOrder ?? image.sort_order ?? 0,
					}))
				: [],
		}));

		return res.status(200).json({
			properties,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: "Unable to load properties right now." });
	}
};
