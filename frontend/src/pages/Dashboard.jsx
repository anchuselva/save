import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bar, Doughnut } from "react-chartjs-2";
import AlertCard from "../components/AlertCard";
import ChartCard from "../components/ChartCard";
import DashboardCard from "../components/DashboardCard";
import { useLanguage } from "../i18n/LanguageContext";
import api from "../services/api";
import { formatLKR } from "../utils/currencyFormatter";

export default function Dashboard() {
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    api.get("/analytics/dashboard")
      .then((r) => setData(r.data))
      .catch((err) => setError(err.response?.data?.message || "Dashboard could not load. Please check the backend and database."));
  }, []);
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!data) return <div>{t("loadingDashboard")}</div>;
  const categories = data.category_spending.map((x) => x.category);
  const amounts = data.category_spending.map((x) => Number(x.total));
  return (
    <>
      <div className="dashboard-top d-flex justify-content-between flex-wrap gap-2 mb-4">
        <div>
          <span className="mini-chip mb-2">{t("monthlyBalance")}</span>
          <h1 className="mb-1">{t("welcomeBack")}</h1>
          <p className="text-secondary mb-0">{t("currentMonth")}</p>
        </div>
        <div className="quick-actions align-self-center">
          <Link className="btn btn-primary" to="/income">{t("addIncome")}</Link>
          <Link className="btn btn-outline-primary" to="/expenses">{t("addExpense")}</Link>
          <Link className="btn btn-outline-primary" to="/scanner">{t("scanBill")}</Link>
          <Link className="btn btn-outline-primary" to="/voice-summary">{t("hearSummary")}</Link>
        </div>
      </div>
      <div className="row g-3 mb-4">
        <div className="col-md-3"><DashboardCard title={t("totalMonthlyIncome")} value={data.total_income} /></div>
        <div className="col-md-3"><DashboardCard title={t("totalMonthlyExpenses")} value={data.total_expenses} tone="text-warning" /></div>
        <div className="col-md-3"><DashboardCard title={t("savings")} value={data.savings} tone="text-green" /></div>
        <div className="col-md-3"><DashboardCard title={t("financialHealthScore")} value={`${data.financial_health.score} - ${data.financial_health.status}`} money={false} /></div>
      </div>
      <div className="row g-3 mb-4">
        <div className="col-lg-8"><ChartCard title={t("incomeVsExpenses")}><Bar data={{ labels: [t("income"), t("expenses"), t("savings")], datasets: [{ label: "LKR", data: [data.total_income, data.total_expenses, data.savings], backgroundColor: ["#176b4d", "#7a1f2b", "#d6a329"] }] }} /></ChartCard></div>
        <div className="col-lg-4"><ChartCard title={t("categorySpending")}><Doughnut data={{ labels: categories, datasets: [{ data: amounts, backgroundColor: ["#7a1f2b", "#d6a329", "#176b4d", "#e76f2e", "#56615f", "#b3522a"] }] }} /></ChartCard></div>
      </div>
      <div className="row g-3">
        <div className="col-lg-4"><div className="app-card p-3 h-100"><h5>{t("dailySpendingStatus")}</h5><p className="mb-1">{t("limit")}: {formatLKR(data.daily.limit)}</p><p>{t("today")}: {formatLKR(data.daily.spent)}</p><div className="progress"><div className="progress-bar bg-warning" style={{ width: `${Math.min((data.daily.spent / (data.daily.limit || 1)) * 100, 100)}%` }} /></div></div></div>
        <div className="col-lg-4"><div className="app-card p-3 h-100"><h5>{t("overspendingAlerts")}</h5>{data.overspending_alerts.length ? data.overspending_alerts.map((b) => <AlertCard key={b.category} title={b.category} text={`${Math.round(b.usage)}% used. ${b.suggestion || "Review this category."}`} />) : <p className="text-secondary">{t("noHighRisk")}</p>}</div></div>
        <div className="col-lg-4"><div className="app-card p-3 h-100"><h5>{t("upcomingBills")}</h5>{data.upcoming_bills.map((b) => <div className="d-flex justify-content-between border-bottom py-2" key={b.id}><span>{b.bill_type}</span><strong>{formatLKR(b.amount)}</strong></div>)}</div></div>
        <div className="col-lg-5"><div className="app-card p-3"><h5>{t("cashLeakageWarning")}</h5><p className="mb-0">{data.cash_leakage_warning.warning ? `You made ${data.cash_leakage_warning.count} small expenses below LKR 500 this week. Total small spending is ${formatLKR(data.cash_leakage_warning.total)}.` : data.cash_leakage_warning.suggestion}</p></div></div>
        <div className="col-lg-7"><div className="app-card p-3"><h5>{t("recentTransactions")}</h5><div className="table-responsive"><table className="table"><tbody>{data.recent_transactions.map((t) => <tr key={t.id}><td>{t.date?.slice(0,10)}</td><td>{t.merchant}</td><td>{t.category}</td><td className="text-end">{formatLKR(t.amount)}</td></tr>)}</tbody></table></div></div></div>
      </div>
    </>
  );
}
