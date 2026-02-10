const API_URL = "http://localhost:8000/api";

export async function login(email, password) {
  const response = await fetch(`${API_URL}/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error("Login failed");
  }

  return response.json();
}

export function getToken() {
  return localStorage.getItem("access_token");
}
