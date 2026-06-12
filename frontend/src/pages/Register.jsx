import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import { authService } from "../services/authService";

export default function Register() {
  const { setLanguage, t } = useLanguage();
  const [form, setForm] = useState({ full_name: "", email: "", password: "", confirm: "", preferred_language: "English" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.full_name.trim()) return setError("Full name is required");
    if (!form.email.trim()) return setError("Email is required");
    if (form.password.length < 8) return setError("Password must be at least 8 characters");
    if (form.password !== form.confirm) return setError("Passwords do not match");
    try {
      setLoading(true);
      const data = await authService.register({
        full_name: form.full_name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        confirm: form.confirm,
        preferred_language: form.preferred_language
      });
      setLanguage(data.user.preferred_language || "English");
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section-pad bg-soft">
      <div className="container">
        <form className="app-card p-4 mx-auto" style={{ maxWidth: 520 }} onSubmit={submit}>
          <h1 className="h3 mb-3">{t("createAccount")}</h1>
          {error && <div className="alert alert-danger">{error}</div>}
          <label className="form-label">{t("fullName")}</label>
          <input className="form-control mb-3" value={form.full_name} required placeholder={t("fullName")} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          <label className="form-label">{t("email")}</label>
          <input className="form-control mb-3" value={form.email} required type="email" placeholder="name@example.com" onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <label className="form-label">{t("password")}</label>
          <input className="form-control mb-3" value={form.password} required minLength="8" type="password" placeholder={t("password")} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <label className="form-label">{t("confirmPassword")}</label>
          <input className="form-control mb-3" value={form.confirm} required minLength="8" type="password" placeholder={t("confirmPassword")} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
          <label className="form-label">{t("preferredLanguage")}</label>
          <select className="form-select mb-3" value={form.preferred_language} onChange={(e) => setForm({ ...form, preferred_language: e.target.value })}>
            <option>English</option>
            <option>Sinhala</option>
            <option>Tamil</option>
          </select>
          <button className="btn btn-primary w-100" disabled={loading}>{loading ? "Creating account..." : t("register")}</button>
        </form>
      </div>
    </section>
  );
}
