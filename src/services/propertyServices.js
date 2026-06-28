export async function fetchProperties() {
  try {
    const response = await fetch("/api/properties");
    const contentType = response.headers.get("content-type") || "";

    if (!response.ok) {
      const errorData = contentType.includes("application/json") 
        ? await response.json() 
        : { message: await response.text() };
      throw new Error(errorData?.message || "Unable to load properties right now.");
    }

    const data = contentType.includes("application/json")
      ? await response.json()
      : { message: await response.text() };

    return Array.isArray(data?.properties) ? data.properties : [];
  } catch (error) {
    console.error(' Error fetching properties:', error);
    throw error;
  }
}

export async function fetchPropertyById(id) {
  try {
    const response = await fetch(`/api/properties/${id}`);
    const contentType = response.headers.get("content-type") || "";

    if (!response.ok) {
      const errorData = contentType.includes("application/json") 
        ? await response.json() 
        : { message: await response.text() };
      throw new Error(errorData?.message || "Unable to load property details.");
    }

    const data = contentType.includes("application/json")
      ? await response.json()
      : { message: await response.text() };

    return data.property || data;
  } catch (error) {
    console.error(' Error fetching property by ID:', error);
    throw error;
  }
}