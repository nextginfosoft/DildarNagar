const AUTH_TOKEN_KEY = 'dn_auth_token';
const AUTH_USER_KEY = 'dn_auth_user';

const auth = {
  getToken() {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },

  getUser() {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  isLoggedIn() {
    return Boolean(this.getToken());
  },

  async register({ full_name, email, password, phone = null }) {
    const response = await api.post('/auth/register', { full_name, email, password, phone });
    this._saveSession(response);
    return response;
  },

  async login({ email, password }) {
    const response = await api.post('/auth/login', { email, password });
    this._saveSession(response);
    return response;
  },

  logout() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  },

  _saveSession(response) {
    if (response?.access_token) {
      localStorage.setItem(AUTH_TOKEN_KEY, response.access_token);
    }
    if (response?.user) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.user));
    }
  },
};

window.auth = auth;
