export async function createBookingRequest({ propertyId, bookingDate, bookingTime, type, message }) {
  try {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const email = userData.email;

    if (!email) {
      throw new Error('Please log in to book a property');
    }

    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Email': email,
      },
      body: JSON.stringify({
        propertyId,
        bookingDate,
        bookingTime,
        type,
        message,
      }),
    });

    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json')
      ? await response.json()
      : { message: await response.text() };

    if (!response.ok) {
      throw new Error(data?.message || 'Unable to create booking request.');
    }

    return data;
  } catch (error) {
    console.error(' Error creating booking request:', error);
    throw error;
  }
}
