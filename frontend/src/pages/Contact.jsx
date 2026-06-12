import { useState } from "react";
import { useLanguage } from "../i18n/LanguageContext";

export default function Contact() {
  const { t } = useLanguage();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("");

  function submit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setStatus("Please complete all contact fields.");
      return;
    }
    setStatus("Thanks. Your message is ready for the SaveLKR team.");
    setForm({ name: "", email: "", message: "" });
  }

  return (
    <section className="section-pad">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-6">
            <h1>{t("contactTitle")}</h1>
            <p className="text-secondary">Email: hello@savelkr.lk<br />Phone: +94 11 234 5678<br />Address: 42 Galle Road, Colombo, Sri Lanka</p>
            <p className="text-secondary">Social: Facebook | Instagram | LinkedIn</p>
          </div>
          <div className="col-lg-6">
            <form className="app-card p-4" onSubmit={submit}>
              {status && <div className={`alert ${status.startsWith("Thanks") ? "alert-success" : "alert-warning"}`}>{status}</div>}
              <input className="form-control mb-3" value={form.name} required placeholder={t("fullName")} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input className="form-control mb-3" value={form.email} required type="email" placeholder={t("email")} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <textarea className="form-control mb-3" value={form.message} required rows="5" placeholder="Message" onChange={(e) => setForm({ ...form, message: e.target.value })} />
              <button className="btn btn-primary">Send Message</button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
