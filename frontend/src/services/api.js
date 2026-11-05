const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// An error that remembers the HTTP status and any field errors from the backend
export class ApiError extends Error {
  constructor(message, status, errors = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status; // 0 means the server could not be reached
    this.errors = errors;
  }
}

// One place for every request to the backend.
// Pass { token } to send the logged-in user's JWT.
export async function apiRequest(path, { method = 'GET', body, token } = {}) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    // fetch only throws when the request never reached the server
    throw new ApiError('Could not reach the server. Is the backend running?', 0);
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(
      data.message || 'Something went wrong',
      response.status,
      data.errors,
    );
  }
  return data;
}
