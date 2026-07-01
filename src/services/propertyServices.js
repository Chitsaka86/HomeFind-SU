
export async function fetchProperties() {
  try {
    console.log(' Fetching properties from API...');
    const response = await fetch("/api/properties");
    console.log(' Response status:', response.status);
    
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
    
    console.log(' Data received:', data);
    
    const properties = Array.isArray(data?.properties) ? data.properties : [];
    console.log(` ${properties.length} properties loaded`);
    
    return properties;
  } catch (error) {
    console.error(' Error fetching properties:', error);
    throw error;
  }
}