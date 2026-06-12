import api from "./api";

export const authService = {
  async register(payload) {
    const { data } = await api.post("/auth/register", payload);
    localStorage.setItem("savelkr_token", data.token);
    localStorage.setItem("savelkr_user", JSON.stringify(data.user));
    localStorage.setItem("savelkr_language", data.user.preferred_language || "English");
    return data;
  },
  async login(payload) {
    const { data } = await api.post("/auth/login", payload);
    localStorage.setItem("savelkr_token", data.token);
    localStorage.setItem("savelkr_user", JSON.stringify(data.user));
    localStorage.setItem("savelkr_language", data.user.preferred_language || "English");
    return data;
  },
  logout() {
    localStorage.removeItem("savelkr_token");
    localStorage.removeItem("savelkr_user");
  },
  isAuthenticated() {
    return Boolean(localStorage.getItem("savelkr_token"));
  }
};
