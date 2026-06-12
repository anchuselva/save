import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import { authService } from "../services/authService";

export default function Login() {
  const { setLanguage, t } = useLanguage();
  const [form, setForm] = useState({ email: "demo@savelkr.lk", password: "password123" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email.trim()) return setError("Email is required");
    if (!form.password) return setError("Password is required");
    try {
      setLoading(true);
      const data = await authService.login({ email: form.email.trim().toLowerCase(), password: form.password });
      setLanguage(data.user.preferred_language || "English");
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section-pad bg-soft">
      <div className="container">
        <form className="app-card p-4 mx-auto" style={{ maxWidth: 460 }} onSubmit={submit}>
          <h1 className="h3 mb-3">{t("login")}</h1>
          {error && <div className="alert alert-danger">{error}</div>}
          <label className="form-label">{t("email")}</label>
          <input className="form-control mb-3" type="email" required placeholder={t("email")} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <label className="form-label">{t("password")}</label>
          <input className="form-control mb-3" type="password" required placeholder={t("password")} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <button className="btn btn-primary w-100" disabled={loading}>{loading ? "Signing in..." : t("login")}</button>
          <p className="small text-secondary mt-3 mb-0">Demo: demo@savelkr.lk / password123</p>
        </form>
      </div>
    </section>
  );
}
