import { create } from "zustand";
import { authApi } from "../services/index";

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem("access_token"),
  isLoading: false,

  setUser: (user) => set({ user, isAuthenticated: true }),

  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const { data } = await authApi.login(credentials);
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      set({ user: data.user, isAuthenticated: true });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data };
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (formData) => {
    set({ isLoading: true });
    try {
      const { data } = await authApi.register(formData);
      localStorage.setItem("access_token", data.tokens.access);
      localStorage.setItem("refresh_token", data.tokens.refresh);
      set({ user: data.user, isAuthenticated: true });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data };
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      const refresh = localStorage.getItem("refresh_token");
      if (refresh) await authApi.logout(refresh);
    } catch (_) {
      // ignore
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      set({ user: null, isAuthenticated: false });
    }
  },

  fetchProfile: async () => {
    try {
      const { data } = await authApi.getProfile();
      set({ user: data });
    } catch (_) {}
  },
}));

export default useAuthStore;
