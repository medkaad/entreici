const API_URL = "http://localhost:8000/api";

/* =========================
   TOKEN UTILS
========================= */

function getAccessToken() {
  return localStorage.getItem("access_token");
}

function getRefreshToken() {
  return localStorage.getItem("refresh_token");
}

function setAccessToken(token) {
  localStorage.setItem("access_token", token);
}

function clearTokens() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

/* =========================
   REFRESH TOKEN
========================= */

async function refreshAccessToken() {
  const refresh = getRefreshToken();

  if (!refresh) {
    throw new Error("No refresh token");
  }

  const response = await fetch(`${API_URL}/users/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (!response.ok) {
    throw new Error("Refresh failed");
  }

  const data = await response.json();
  setAccessToken(data.access);

  return data.access;
}

/* =========================
   FETCH WRAPPER
========================= */

async function fetchWithAuth(url, options = {}) {
  let accessToken = getAccessToken();

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...(options.headers || {}),
    },
  });

  // Token expiré → refresh
  if (response.status === 401) {
    try {
      accessToken = await refreshAccessToken();

      return fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          ...(options.headers || {}),
        },
      });
    } catch (error) {
      clearTokens();
      window.location.href = "/login";
      throw error;
    }
  }

  return response;
}

/* =========================
   HANDLE RESPONSE
========================= */

async function handleResponse(response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Erreur API");
  }

  // DELETE peut retourner vide
  if (response.status === 204) {
    return null;
  }

  return response.json();
}

/* =========================
   AUTH
========================= */

export async function login(email, password) {
  const response = await fetch(`${API_URL}/users/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await handleResponse(response);

  localStorage.setItem("access_token", data.access);
  localStorage.setItem("refresh_token", data.refresh);
  localStorage.setItem("user_email", email);

  return data;
}

export function logout() {
  clearTokens();
  localStorage.removeItem("user_email");
}

/* =========================
   ANNONCES
========================= */

export async function getAnnonces(filters = {}) {
  const params = new URLSearchParams(filters).toString();

  const response = await fetchWithAuth(
    `${API_URL}/annonces/?${params}`
  );

  return handleResponse(response);
}

export async function getMyAnnonces() {
  const response = await fetchWithAuth(
    `${API_URL}/annonces/mine/`
  );

  return handleResponse(response);
}

export async function createAnnonce(data) {
  const response = await fetchWithAuth(
    `${API_URL}/annonces/`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );

  return handleResponse(response);
}

export async function updateAnnonce(id, data) {
  const response = await fetchWithAuth(
    `${API_URL}/annonces/${id}/`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    }
  );

  return handleResponse(response);
}

export async function deleteAnnonce(id) {
  const response = await fetchWithAuth(
    `${API_URL}/annonces/${id}/`,
    {
      method: "DELETE",
    }
  );

  return handleResponse(response);
}

/* =========================
   CHAT
========================= */

export async function getConversations() {
  const response = await fetchWithAuth(
    `${API_URL}/chat/conversations/`
  );

  return handleResponse(response);
}

export async function createConversation(annonceId) {
  const response = await fetchWithAuth(
    `${API_URL}/chat/conversations/`,
    {
      method: "POST",
      body: JSON.stringify({ annonce: annonceId }),
    }
  );

  return handleResponse(response);
}

export async function getMessages(conversationId) {
  const response = await fetchWithAuth(
    `${API_URL}/chat/conversations/${conversationId}/messages/`
  );

  return handleResponse(response);
}

export async function sendMessage(conversationId, content) {
  const response = await fetchWithAuth(
    `${API_URL}/chat/conversations/${conversationId}/messages/`,
    {
      method: "POST",
      body: JSON.stringify({ content }),
    }
  );

  return handleResponse(response);
}

/* =========================
   REGISTER
========================= */

export async function registerUser(data) {
  const response = await fetch(`${API_URL}/users/register/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return handleResponse(response);
}

export async function getMe() {
  const response = await fetchWithAuth(
    `${API_URL}/users/me/`
  );

  return handleResponse(response);
}
