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

export async function getAnnonces(filters = {}) {
  const token = localStorage.getItem("access_token");

  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(
      ([_, value]) => value !== undefined && value !== ""
    )
  );

  const params = new URLSearchParams(cleanFilters).toString();

  const response = await fetch(`${API_URL}/annonces/?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Erreur chargement annonces");
  }

  return response.json();
}

export async function createAnnonce(data) {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_URL}/annonces/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Erreur création annonce");
  }

  return response.json();
}
