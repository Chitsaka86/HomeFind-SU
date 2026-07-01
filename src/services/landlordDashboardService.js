export async function fetchLandlordDashboard(email) {
  console.log(' fetchLandlordDashboard called with email:', email);
  
  if (!email) {
    console.error(' No email provided');
    throw new Error('Email is required');
  }

  const url = `/api/landlord-dashboard?email=${encodeURIComponent(email.trim())}`;
  console.log(' Full URL:', url);
  
  try {
    const response = await fetch(url);
    console.log('Response status:', response.status);
    
    const contentType = response.headers.get("content-type") || "";

    if (!response.ok) {
      const errorData = contentType.includes("application/json") 
        ? await response.json() 
        : { message: await response.text() };
      console.error(' API Error:', errorData);
      throw new Error(errorData?.message || "Unable to load landlord dashboard data right now.");
    }

    const data = contentType.includes("application/json")
      ? await response.json()
      : { message: await response.text() };

    console.log('Data received:', data);

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
    console.error(' Error in fetchLandlordDashboard:', error);
    throw error;
  }
}


export async function createProperty(propertyData) {
  console.log(' createProperty called with:', propertyData);
  
  try {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const email = userData.email;
    
    if (!email) {
      throw new Error('User email not found. Please log in again.');
    }

    
    const payload = {
      ...propertyData,
      images: Array.isArray(propertyData.images)
        ? propertyData.images
            .filter((image) => image && typeof image === 'object' && image.url)
            .map((image, index) => ({
              url: image.url,
              caption: image.caption || '',
              sortOrder: image.sortOrder ?? index,
            }))
        : [],
    };

    console.log(' Sending payload with images:', payload.images.length);

    const response = await fetch('/api/properties', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Email': email,
      },
      body: JSON.stringify(payload),
    });

    console.log(' Response status:', response.status);
    
    const contentType = response.headers.get("content-type") || "";
    let data;
    
    try {
      data = contentType.includes("application/json")
        ? await response.json()
        : { message: await response.text() };
    } catch (parseError) {
      console.error(' Error parsing response:', parseError);
      throw new Error('Invalid response from server');
    }

    console.log(' Response data:', data);

    if (!response.ok) {
      const errorMessage = data?.error || data?.message || "Unable to create property.";
      console.error(' Server error:', errorMessage);
      throw new Error(errorMessage);
    }

    console.log(' Property created:', data);
    return data;
    
  } catch (error) {
    console.error(' Error creating property:', error);
    throw error;
  }
}