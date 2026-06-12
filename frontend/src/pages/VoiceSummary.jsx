import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext";
import api from "../services/api";
import { formatLKR } from "../utils/currencyFormatter";
import { speak, stopSpeaking, summaries, translateCategory } from "../utils/voiceUtils";

export default function VoiceSummary() {
  const { language, setLanguage, t } = useLanguage();
  const [data, setData] = useState(null);
  const [voiceStatus, setVoiceStatus] = useState("");
  useEffect(() => { api.get("/analytics/dashboard").then((r) => setData(r.data)); }, []);
  const text = useMemo(() => {
    if (!data) return "";
    const highest = translateCategory(data.category_spending[0]?.category || "None", language);
    const overspent = data.budget_summary.filter((b) => b.risk === "Overspent").map((b) => translateCategory(b.category, language)).join(", ") || translateCategory("None", language);
    const bills = data.upcoming_bills.map((b) => b.bill_type).join(", ") || translateCategory("None", language);
    return summaries[language]({ income: formatLKR(data.total_income), expenses: formatLKR(data.total_expenses), savings: formatLKR(data.savings), highest, overspent, bills });
  }, [data, language]);

  function play() {
    const result = speak(text, language);
    setVoiceStatus(result.message || "");
  }

  return (
    <div className="app-card p-4">
      <h1>{t("voiceSummary")}</h1>
      <select className="form-select w-auto mb-3" value={language} onChange={(e) => setLanguage(e.target.value)}><option>English</option><option>Sinhala</option><option>Tamil</option></select>
      <p className="lead">{text || t("loadingSummary")}</p>
      {voiceStatus && <div className="alert alert-warning">{voiceStatus}</div>}
      <div className="d-flex gap-2 flex-wrap">
        <button className="btn btn-primary" onClick={play} disabled={!text}>{t("playVoice")}</button>
        <button className="btn btn-outline-primary" type="button" onClick={stopSpeaking}>{t("stop")}</button>
      </div>
      <p className="text-secondary small mt-3 mb-0">{t("voiceFallback")}</p>
    </div>
  );
}
