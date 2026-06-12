import FeatureCard from "../components/FeatureCard";
import HeroSection from "../components/HeroSection";
import { useLanguage } from "../i18n/LanguageContext";

const features = [
  ["Income Tracking", "Record salary, freelance, allowance and business income."],
  ["OCR Bill Scanner", "Upload bills and convert verified totals into expenses."],
  ["Voice Summary", "Hear your month in English, Sinhala or Tamil."],
  ["Smart Alerts", "Spot overspending, due bills and frequent small expenses."]
];

export default function Home() {
  const { t } = useLanguage();

  return (
    <>
      <HeroSection />
      <section className="section-pad">
        <div className="container">
          <div className="row g-3">{features.map((f) => <div className="col-md-6 col-lg-3" key={f[0]}><FeatureCard title={f[0]} text={f[1]} /></div>)}</div>
        </div>
      </section>
      <section className="section-pad bg-soft">
        <div className="container">
          <div className="row g-4 align-items-center">
            <div className="col-lg-5"><h2>{t("howItWorks")}</h2><p className="text-secondary">{t("howItWorksText")}</p></div>
            <div className="col-lg-7"><div className="row g-3">{["Set monthly budgets", "Track every LKR", "Review charts and alerts", "Listen to a summary"].map((step, i) => <div className="col-sm-6" key={step}><div className="app-card p-4 h-100"><span className="badge text-bg-warning mb-2">Step {i + 1}</span><h5>{step}</h5></div></div>)}</div></div>
          </div>
        </div>
      </section>
      <section className="section-pad">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-6"><h2>{t("whyChoose")}</h2><p className="text-secondary">{t("whyChooseText")}</p></div>
            <div className="col-lg-6"><div className="app-card p-4"><h5>{t("dashboardPreview")}</h5><div className="row g-3 mt-1"><div className="col-6"><div className="p-3 bg-soft rounded">{t("income")}<br /><strong>LKR 222,000</strong></div></div><div className="col-6"><div className="p-3 bg-soft rounded">{t("expenses")}<br /><strong>LKR 83,100</strong></div></div><div className="col-12"><div className="progress"><div className="progress-bar bg-warning" style={{ width: "62%" }} /></div></div></div></div></div>
          </div>
        </div>
      </section>
    </>
  );
}
