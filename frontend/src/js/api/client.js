export const API_BASE_URL = "https://website-asientos-2-0-backend.onrender.com/api";

export async function apiFetch(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw new Error(
      typeof data === "object" && data?.message
        ? data.message
        : "Error en la petición"
    );
  }

  return data;
}