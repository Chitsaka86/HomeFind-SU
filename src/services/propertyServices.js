export async function fetchProperties() {
  const response = await fetch("/api/properties");
  const contentType = response.headers.get("content-type") || "";

  const data = contentType.includes("application/json")
    ? await response.json()
    : { message: await response.text() };

  if (!response.ok) {
    throw new Error(data?.message || "Unable to load properties right now.");
  }

  return Array.isArray(data?.properties) ? data.properties : [];
}