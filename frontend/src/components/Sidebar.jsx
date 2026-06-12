import { NavLink, useNavigate } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import { authService } from "../services/authService";

const links = [
  ["DB", "dashboard", "/dashboard"], ["IN", "income", "/income"], ["EX", "expenses", "/expenses"], ["BG", "Budgets", "/budgets"],
  ["SC", "scanBill", "/scanner"], ["RM", "Reminders", "/reminders"], ["RP", "Reports", "/reports"], ["VS", "voiceSummary", "/voice-summary"],
  ["HS", "financialHealthScore", "/financial-health"], ["BY", "Before You Buy", "/budget-before-buy"], ["CL", "cashLeakageWarning", "/cash-leakage"],
  ["DL", "dailySpendingStatus", "/daily-limit"], ["PF", "Profile", "/profile"]
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  return (
    <aside className="sidebar">
      <div className="d-flex align-items-center gap-2 mb-3">
        <span className="mini-chip">SL</span>
        <div className="brand-mark fs-4">SaveLKR</div>
      </div>
      <div className="sidebar-links">
        {links.map(([icon, label, path]) => <NavLink key={path} to={path}><span className="me-2 small fw-black">{icon}</span>{t(label)}</NavLink>)}
      </div>
      <button className="btn btn-outline-primary w-100 mt-3" onClick={() => { authService.logout(); navigate("/login"); }}>{t("logout")}</button>
    </aside>
  );
}
