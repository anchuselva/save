import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";

export default function HeroSection() {
  const { t } = useLanguage();

  return (
    <section className="hero">
      <div className="container py-5">
        <div className="row align-items-center g-4">
          <div className="col-lg-7">
            <h1>SaveLKR</h1>
            <p className="fs-3 fw-semibold mb-2">{t("tagline")}</p>
            <p className="fs-5">{t("subtitle")}</p>
            <div className="d-flex gap-2 mt-4">
              <Link className="btn btn-primary btn-lg" to="/register">{t("getStarted")}</Link>
              <Link className="btn btn-outline-primary btn-lg" to="/features">{t("learnMore")}</Link>
            </div>
          </div>
          <div className="col-lg-5">
            <div className="hero-visual">
              <div className="hero-stat a"><small>{t("savings")}</small><strong className="d-block text-green">38%</strong></div>
              <div className="hero-stat b"><small>{t("alerts")}</small><strong className="d-block text-maroon">3</strong></div>
              <div className="hero-device">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <div className="small text-secondary">{t("monthlyBalance")}</div>
                    <h3 className="mb-0">LKR 86,000</h3>
                  </div>
                  <span className="mini-chip">LKR</span>
                </div>
                <div className="row g-2 mb-3">
                  <div className="col-6"><div className="app-card p-3"><small>{t("income")}</small><h5 className="mb-0 text-green">222K</h5></div></div>
                  <div className="col-6"><div className="app-card p-3"><small>{t("expenses")}</small><h5 className="mb-0 text-maroon">136K</h5></div></div>
                </div>
                <div className="d-flex align-items-end gap-2" style={{ height: 130 }}>
                  {[54, 76, 48, 92, 68, 84, 58].map((h, i) => (
                    <div key={i} className="flex-fill rounded-top" style={{ height: `${h}%`, background: i % 2 ? "#7c67f2" : "#22c6c7" }} />
                  ))}
                </div>
                <div className="alert alert-warning mt-3 mb-0 py-2">{t("billDue")}</div>
              </div>
              <div className="hero-person one">S</div>
              <div className="hero-person two">L</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
