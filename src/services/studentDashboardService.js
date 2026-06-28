export async function fetchStudentDashboard(email) {
  
  if (!email) {
    console.error(' No email provided to fetchStudentDashboard');
    throw new Error('Email is required');
  }

  const encodedEmail = encodeURIComponent(email.trim());
  const url = `/api/student-dashboard?email=${encodedEmail}`;
  
  console.log(' Fetching student dashboard with URL:', url);
  
  try {
    const response = await fetch(url);
    const contentType = response.headers.get("content-type") || "";

    if (!response.ok) {
      const errorData = contentType.includes("application/json") 
        ? await response.json() 
        : { message: await response.text() };
      console.error(' API Error Response:', errorData);
      throw new Error(errorData?.message || "Unable to load student dashboard data right now.");
    }

    const data = contentType.includes("application/json")
      ? await response.json()
      : { message: await response.text() };

    console.log(' Student dashboard data received:', data);
    return data;
  } catch (error) {
    console.error(' Error fetching student dashboard:', error);
    throw error;
  }
}