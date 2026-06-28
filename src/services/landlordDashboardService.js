export async function fetchLandlordDashboard(email) {
  const url = email ? `/api/landlord-dashboard?email=${encodeURIComponent(email)}` : "/api/landlord-dashboard";
  
  console.log(' Fetching landlord dashboard with URL:', url);
  
  try {
    const response = await fetch(url);
    const contentType = response.headers.get("content-type") || "";

    if (!response.ok) {
      const errorData = contentType.includes("application/json") 
        ? await response.json() 
        : { message: await response.text() };
      throw new Error(errorData?.message || "Unable to load landlord dashboard data right now.");
    }

    const data = contentType.includes("application/json")
      ? await response.json()
      : { message: await response.text() };

    return {
      landlord: data?.landlord || null,
      stats: data?.stats || {
        totalProperties: 0,
        pendingApprovals: 0,
        confirmedBookings: 0,
      },
      recentListings: Array.isArray(data?.recentListings) ? data.recentListings : [],
      properties: Array.isArray(data?.properties) ? data.properties : [],
      bookings: Array.isArray(data?.bookings) ? data.bookings : [],
    };
  } catch (error) {
    console.error(' Error fetching landlord dashboard:', error);
    throw error;
  }
}

export async function createProperty(propertyData) {
  try {
    const response = await fetch("/api/properties", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(propertyData),
    });

    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json") 
      ? await response.json() 
      : { message: await response.text() };

    if (!response.ok) {
      throw new Error(data?.message || "Unable to create property.");
    }

    return data;
  } catch (error) {
    console.error('Error creating property:', error);
    throw error;
  }
}