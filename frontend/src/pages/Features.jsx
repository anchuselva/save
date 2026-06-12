import FeatureCard from "../components/FeatureCard";
import { useLanguage } from "../i18n/LanguageContext";

const items = ["Monthly income tracking", "Category-wise budgeting", "Manual expense entry", "OCR bill scanning", "Overspending alerts", "Smart suggestions", "Bill reminders", "Financial charts", "Tamil/Sinhala/English voice summaries", "Financial Health Score", "Budget Before You Buy", "Cash Leakage Detector", "Daily Spending Limit"];

export default function Features() {
  const { t } = useLanguage();

  return (
    <section className="section-pad">
      <div className="container">
        <h1>{t("featuresTitle")}</h1>
        <p className="text-secondary mb-4">{t("featuresIntro")}</p>
        <div className="row g-3">{items.map((item) => <div className="col-md-6 col-lg-4" key={item}><FeatureCard title={item} text="Designed to keep monthly spending visible, controlled, and easy to act on." /></div>)}</div>
      </div>
    </section>
  );
}
