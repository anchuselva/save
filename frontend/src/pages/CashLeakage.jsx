import { useEffect, useState } from "react";
import api from "../services/api";
import { formatLKR } from "../utils/currencyFormatter";

export default function CashLeakage() {
  const [data, setData] = useState(null);
  useEffect(() => { api.get("/analytics/cash-leakage").then((r) => setData(r.data)); }, []);
  if (!data) return <div>Checking cash leakage...</div>;
  return (
    <div className="app-card p-4">
      <h1>Cash Leakage Detector</h1>
      {data.warning ? <div className="alert alert-warning">You made {data.count} small expenses below LKR 500 this week. Total small spending is {formatLKR(data.total)}.</div> : <div className="alert alert-success">No frequent small-expense leakage detected this week.</div>}
      <p><strong>Most frequent category:</strong> {data.category || "None"}</p>
      <p><strong>Suggestion:</strong> {data.suggestion}</p>
    </div>
  );
}
