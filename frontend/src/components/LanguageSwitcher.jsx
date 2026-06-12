import { languages, useLanguage } from "../i18n/LanguageContext";

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <select className="form-select form-select-sm w-auto" aria-label={t("language")} value={language} onChange={(e) => setLanguage(e.target.value)}>
      {languages.map((item) => <option key={item.code} value={item.code}>{item.label}</option>)}
    </select>
  );
}
