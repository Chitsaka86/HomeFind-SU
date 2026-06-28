export async function sendMagicLink(email, role) {
  try {
    const response = await fetch("/api/magic-link/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, role }),
    });

    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await response.json()
      : { message: await response.text() };

    if (!response.ok) {
      throw new Error(data?.message || "Unable to send magic link right now.");
    }

    return data;
  } catch (error) {
    console.error(' Error sending magic link:', error);
    throw error;
  }
}

export function getUserFromLocalStorage() {
  try {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    return userData;
  } catch {
    return {};
  }
}

export function setUserInLocalStorage(userData) {
  localStorage.setItem('user', JSON.stringify(userData));
}

export function clearUserFromLocalStorage() {
  localStorage.removeItem('user');
}

export function isAuthenticated() {
  const user = getUserFromLocalStorage();
  return !!user?.email;
}