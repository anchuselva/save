import { useLanguage } from "../i18n/LanguageContext";

export default function About() {
  const { t } = useLanguage();

  return (
    <section className="section-pad">
      <div className="container">
        <h1>{t("aboutTitle")}</h1>
        <p className="lead text-secondary">{t("aboutText")}</p>
        <div className="app-card p-4 mt-4">
          <p>It combines monthly income tracking, category-wise budgets, scanned receipts, bill reminders, charts, health scoring and multilingual voice summaries into one focused financial workspace. The experience is localized around LKR and common Sri Lankan spending patterns.</p>
        </div>
      </div>
    </section>
  );
}
