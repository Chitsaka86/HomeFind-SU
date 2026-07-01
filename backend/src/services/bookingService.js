export async function updateBookingStatus(bookingId, status) {
    console.log(`updateBookingStatus called for ID: ${bookingId}, status: ${status}`);
    
    try {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        const email = userData.email;
        
        if (!email) {
            throw new Error('User email not found. Please log in again.');
        }
        
        const response = await fetch(`/api/bookings/${bookingId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-User-Email': email,
            },
            body: JSON.stringify({ status }),
        });
        
        console.log(`Response status: ${response.status}`);
        
        const contentType = response.headers.get("content-type") || "";
        let data;
        
        try {
            data = contentType.includes("application/json")
                ? await response.json()
                : { message: await response.text() };
        } catch (parseError) {
            console.error('Error parsing response:', parseError);
            throw new Error('Invalid response from server');
        }
        
        console.log('Response data:', data);
        
        if (!response.ok) {
            const errorMessage = data?.error || data?.message || "Unable to update booking.";
            console.error('Server error:', errorMessage);
            throw new Error(errorMessage);
        }
        
        console.log('Booking updated successfully:', data);
        return data;
        
    } catch (error) {
        console.error('Error updating booking:', error);
        throw error;
    }
}