import { useEffect, useState } from "react";
import api from "../services/api";
import { formatLKR } from "../utils/currencyFormatter";

export default function DailyLimit() {
  const [limit, setLimit] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      const [l, d] = await Promise.all([api.get("/daily-limit"), api.get("/analytics/dashboard")]);
      setLimit(l.data);
      setDashboard(d.data);
      setAmount(l.data?.limit_amount || "");
    } catch (err) {
      setError(err.response?.data?.message || "Could not load daily limit.");
    }
  };

  useEffect(() => { load(); }, []);

  async function save(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!amount || Number(amount) <= 0) return setError("Daily limit must be greater than 0.");

    setLoading(true);
    try {
      limit ? await api.put(`/daily-limit/${limit.id}`, { limit_amount: amount }) : await api.post("/daily-limit", { limit_amount: amount });
      setMessage("Daily limit saved.");
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save daily limit.");
    } finally {
      setLoading(false);
    }
  }

  const spent = dashboard?.daily.spent || 0;
  const cap = Number(amount || 0);
  const pct = cap ? (spent / cap) * 100 : 0;

  return (
    <div className="app-card p-4">
      <h1>Daily Spending Limit</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}
      <form className="d-flex gap-2 mb-4 flex-wrap" onSubmit={save}>
        <input className="form-control flex-grow-1" min="1" required type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Daily limit" />
        <button className="btn btn-primary" disabled={loading}>{loading ? "Saving..." : "Save"}</button>
      </form>
      <p>Daily limit: {formatLKR(cap)}</p>
      <p>Today's spending: {formatLKR(spent)}</p>
      <p>Remaining amount: {formatLKR(cap - spent)}</p>
      <div className="progress mb-3"><div className={`progress-bar ${pct >= 100 ? "bg-danger" : pct >= 80 ? "bg-warning" : "bg-success"}`} style={{ width: `${Math.min(pct, 100)}%` }} /></div>
      {pct >= 100 ? <div className="alert alert-danger">Daily spending limit exceeded.</div> : pct >= 80 ? <div className="alert alert-warning">You have reached 80% of your daily spending limit.</div> : <div className="alert alert-success">Daily spending is within limit.</div>}
    </div>
  );
}
