export async function fetchStudentDashboard() {
  const response = await fetch("/api/student-dashboard");
  const contentType = response.headers.get("content-type") || "";

  const data = contentType.includes("application/json")
    ? await response.json()
    : { message: await response.text() };

  if (!response.ok) {
    throw new Error(data?.message || "Unable to load student dashboard data right now.");
  }

  return data;
}