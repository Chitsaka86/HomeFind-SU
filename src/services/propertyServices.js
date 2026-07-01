export async function fetchProperties() {
  try {
    console.log('Fetching properties from API...');
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
    
    console.log('Full response data:', data);
    
    const properties = Array.isArray(data?.properties) ? data.properties : [];
    console.log(`${properties.length} properties loaded`);
    
    
    properties.forEach((prop, index) => {
      console.log(` Property ${index + 1}: ${prop.title}`);
      console.log(`   Has images array: ${Array.isArray(prop.images)}`);
      console.log(`   Image count: ${prop.images?.length || 0}`);
      if (prop.images && prop.images.length > 0) {
        console.log(`   First image URL: ${prop.images[0].url?.substring(0, 50)}...`);
        console.log(`   Image type: ${prop.images[0].url?.startsWith('data:') ? 'base64' : 'url'}`);
      }
    });
    
    return properties;
  } catch (error) {
    console.error('Error fetching properties:', error);
    throw error;
  }
}