import { useEffect, useState } from "react";
import api from "../services/api";

export default function FinancialHealth() {
  const [data, setData] = useState(null);
  useEffect(() => { api.get("/analytics/financial-health").then((r) => setData(r.data)); }, []);
  if (!data) return <div>Loading financial health...</div>;
  return (
    <div className="app-card p-4">
      <h1>Financial Health Score</h1>
      <div className="display-3 fw-bold text-maroon">{data.score}</div>
      <h3>{data.status}</h3>
      <h5 className="mt-4">Reasons</h5>
      {data.reasons.length ? data.reasons.map((r) => <div className="alert alert-warning" key={r}>{r}</div>) : <p className="text-secondary">No deductions this month.</p>}
      <h5>Suggestions</h5>
      <ul>{data.suggestions.map((s) => <li key={s}>{s}</li>)}</ul>
    </div>
  );
}
