const TOKEN_KEY = "tac_token";

/**
 * The backend's CORS setup (`app.use(cors())`) does not enable
 * credentialed cross-origin requests, so browser cookies set by the
 * login endpoint cannot reliably be used from a separately-hosted
 * frontend. Both /login and /register already return the JWT directly
 * in the response body, so we store it ourselves and send it back as a
 * Bearer token — the auth middleware accepts either mechanism.
 */
export const authStorage = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },
  clearToken() {
    localStorage.removeItem(TOKEN_KEY);
  },
};
