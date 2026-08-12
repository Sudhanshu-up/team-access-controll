import { api } from "@/api/axios";
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  User,
} from "@/types/auth.types";

export const authService = {
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>(
      "/api/auth/users/register",
      payload
    );
    return data;
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>(
      "/api/auth/users/login",
      payload
    );
    return data;
  },

  async logout(): Promise<void> {
    await api.get("/api/auth/users/logout");
  },

  /** Returns the raw user document (this endpoint is not envelope-wrapped). */
  async getProfile(): Promise<User> {
    const { data } = await api.get<User>("/api/auth/users/profile");
    return data;
  },
};
