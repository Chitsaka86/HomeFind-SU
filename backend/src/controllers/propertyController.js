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
		console.log('🔍 Fetching properties with images...');
		
		
		const propertiesQuery = `
			SELECT 
				p.property_id,
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
				l.full_name as landlord_name,
				COALESCE(
					(SELECT COUNT(*) FROM properties WHERE landlord_id = p.landlord_id),
					0
				) as landlord_listings
			FROM properties p
			LEFT JOIN landlords l ON l.landlord_id = p.landlord_id
			ORDER BY p.created_at DESC NULLS LAST, p.title ASC
		`;

		const propertiesResult = await pool.query(propertiesQuery);
		
		console.log(`Found ${propertiesResult.rows.length} properties`);

		
		const properties = [];
		
		for (const row of propertiesResult.rows) {
			
			const imagesQuery = `
				SELECT 
					url,
					caption,
					sort_order
				FROM property_images
				WHERE property_id = $1
				ORDER BY sort_order NULLS LAST, uploaded_at ASC
			`;
			
			const imagesResult = await pool.query(imagesQuery, [row.property_id]);
			
			
			const reviewsQuery = `
				SELECT 
					s.full_name as name,
					to_char(rv.created_at, 'FMMonth YYYY') as date,
					COALESCE(rv.overall_rating, 0) as rating,
					COALESCE(rv.comment, '') as comment
				FROM reviews rv
				LEFT JOIN students s ON s.student_id = rv.student_id
				WHERE rv.property_id = $1
				ORDER BY rv.created_at DESC
				LIMIT 10
			`;
			
			let reviews = [];
			try {
				const reviewsResult = await pool.query(reviewsQuery, [row.property_id]);
				reviews = reviewsResult.rows;
			} catch (reviewError) {
				console.log('Reviews table might not exist yet:', reviewError.message);
				reviews = [];
			}
			
			
			let avgRating = 0;
			let reviewCount = 0;
			try {
				const ratingQuery = `
					SELECT 
						COALESCE(AVG(overall_rating), 0) as avg_rating,
						COUNT(*) as review_count
					FROM reviews
					WHERE property_id = $1
				`;
				const ratingResult = await pool.query(ratingQuery, [row.property_id]);
				avgRating = parseFloat(ratingResult.rows[0]?.avg_rating) || 0;
				reviewCount = parseInt(ratingResult.rows[0]?.review_count) || 0;
			} catch (ratingError) {
				console.log('Rating calculation error:', ratingError.message);
			}
			
			
			let distance = 0;
			if (row.latitude && row.longitude) {
				
				const latDiff = row.latitude - STRATHMORE_LATITUDE;
				const lngDiff = row.longitude - STRATHMORE_LONGITUDE;
				distance = Math.round(Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111);
			}
			
			
			let images = [];
			if (imagesResult.rows.length > 0) {
				images = imagesResult.rows.map(img => ({
					url: img.url,
					caption: img.caption || '',
					sortOrder: img.sort_order || 0
				}));
			}
			
			console.log(`📸 Property ${row.title}: ${images.length} images`);
			
			properties.push({
				id: row.property_id,
				title: row.title || 'Property',
				location: row.location || 'Unknown',
				latitude: row.latitude == null ? null : Number(row.latitude),
				longitude: row.longitude == null ? null : Number(row.longitude),
				distance: distance,
				price: toNumber(row.price, 0),
				status: normalizeStatus(row.status),
				rating: avgRating,
				reviews: reviewCount,
				amenities: Array.isArray(row.amenities) ? row.amenities : [],
				rules: row.house_rules || "",
				landlord: {
					name: row.landlord_name || "Unknown landlord",
					listings: toNumber(row.landlord_listings, 0),
				},
				reviewList: reviews,
				propertyType: row.property_type || "",
				images: images,
			});
		}

		console.log(`Returning ${properties.length} properties`);
		return res.status(200).json({
			properties,
		});
		
	} catch (error) {
		console.error('Error in getProperties:', error);
		console.error('Error stack:', error.stack);
		return res.status(500).json({ 
			message: "Unable to load properties right now.",
			error: error.message 
		});
	}
};