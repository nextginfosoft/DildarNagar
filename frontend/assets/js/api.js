// Central API connector — all fetch calls go through here
// For production: set window.API_BASE in index.html or use environment variable
const API_BASE = window.API_BASE || 
                (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
                  ? 'http://127.0.0.1:8001/api' 
                  : 'https://your-backend.railway.app/api'); // Update with your backend URL

const parseJsonSafe = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) return null;
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const buildApiError = (response, data) => {
  let detail = `API Error: ${response.status}`;
  if (typeof data?.detail === 'string') {
    detail = data.detail;
  }

  const error = new Error(detail);
  error.status = response.status;
  error.data = data;
  return error;
};

const api = {
  get: async (endpoint) => {
    const res = await fetch(`${API_BASE}${endpoint}`);
    const data = await parseJsonSafe(res);
    if (!res.ok) throw buildApiError(res, data);
    return data;
  },
  post: async (endpoint, data, token = null) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });
    const result = await parseJsonSafe(res);
    if (!res.ok) throw buildApiError(res, result);
    return result;
  }
};

// Usage examples:
// const listings = await api.get('/listings?limit=6');
// const user = await api.post('/auth/login', {email, password});

// Export to global window object
window.api = api;
window.API_BASE = API_BASE;

