import * as React from "react";

import { authService } from "@/services/auth.service";
import { authStorage } from "@/lib/authStorage";
import type { LoginPayload, RegisterPayload, User } from "@/types/auth.types";

interface AuthContextValue {
  user: User | null;
  /** True while we're checking an existing token on first load. */
  isInitializing: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  // If there's no stored token, there's nothing to initialize.
  const [isInitializing, setIsInitializing] = React.useState(
    () => !!authStorage.getToken()
  );

  const loadProfile = React.useCallback(async () => {
    try {
      const profile = await authService.getProfile();
      setUser(profile);
    } catch {
      authStorage.clearToken();
      setUser(null);
    }
  }, []);

  React.useEffect(() => {
    if (!authStorage.getToken()) return;

    let cancelled = false;
    (async () => {
      await loadProfile();
      if (!cancelled) setIsInitializing(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [loadProfile]);

  React.useEffect(() => {
    const handleUnauthorized = () => setUser(null);
    window.addEventListener("tac:unauthorized", handleUnauthorized);
    return () =>
      window.removeEventListener("tac:unauthorized", handleUnauthorized);
  }, []);

  const login = React.useCallback(async (payload: LoginPayload) => {
    const { token, user: loggedInUser } = await authService.login(payload);
    authStorage.setToken(token);
    setUser(loggedInUser);
  }, []);

  const register = React.useCallback(async (payload: RegisterPayload) => {
    // The register endpoint does not set a session cookie, but it does
    // return a usable JWT in the body, so we can log the user in right away.
    const { token, user: registeredUser } = await authService.register(
      payload
    );
    authStorage.setToken(token);
    setUser(registeredUser);
  }, []);

  const logout = React.useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      authStorage.clearToken();
      setUser(null);
    }
  }, []);

  const value = React.useMemo(
    () => ({
      user,
      isInitializing,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      refreshProfile: loadProfile,
    }),
    [user, isInitializing, login, register, logout, loadProfile]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
