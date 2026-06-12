import { useEffect, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext";
import api from "../services/api";

export default function Profile() {
  const { setLanguage } = useLanguage();
  const [form, setForm] = useState({ full_name: "", email: "", preferred_language: "English", voice_language: "English", password: "" });
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/auth/profile")
      .then((r) => setForm({ ...r.data, password: "" }))
      .catch((err) => setError(err.response?.data?.message || "Could not load profile."));
  }, []);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setMsg("");
    if (!form.full_name.trim()) return setError("Full name is required.");
    if (!form.email.trim()) return setError("Email is required.");

    setLoading(true);
    try {
      const { data } = await api.put("/auth/profile", form);
      localStorage.setItem("savelkr_user", JSON.stringify(data));
      setLanguage(data.preferred_language || "English");
      setMsg("Profile updated.");
      setForm({ ...data, password: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Could not update profile.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="app-card p-4" onSubmit={submit} style={{ maxWidth: 680 }}>
      <h1>Profile / Settings</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      {msg && <div className="alert alert-success">{msg}</div>}
      <label className="form-label">Full name</label>
      <input className="form-control mb-3" required value={form.full_name || ""} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
      <label className="form-label">Email</label>
      <input className="form-control mb-3" type="email" required value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <label className="form-label">Preferred language</label>
      <select className="form-select mb-3" value={form.preferred_language || "English"} onChange={(e) => setForm({ ...form, preferred_language: e.target.value })}><option>English</option><option>Sinhala</option><option>Tamil</option></select>
      <label className="form-label">Voice summary language</label>
      <select className="form-select mb-3" value={form.voice_language || "English"} onChange={(e) => setForm({ ...form, voice_language: e.target.value })}><option>English</option><option>Sinhala</option><option>Tamil</option></select>
      <label className="form-label">New password</label>
      <input className="form-control mb-3" type="password" minLength="8" value={form.password || ""} onChange={(e) => setForm({ ...form, password: e.target.value })} />
      <button className="btn btn-primary" disabled={loading}>{loading ? "Saving..." : "Save Settings"}</button>
    </form>
  );
}
