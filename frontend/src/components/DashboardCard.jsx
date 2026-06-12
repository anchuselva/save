import { formatLKR } from "../utils/currencyFormatter";

export default function DashboardCard({ title, value, tone = "text-maroon", money = true }) {
  return (
    <div className="app-card stat p-3 h-100">
      <div className="text-secondary small">{title}</div>
      <div className={`fs-3 fw-bold ${tone}`}>{money ? formatLKR(value) : value}</div>
    </div>
  );
}
