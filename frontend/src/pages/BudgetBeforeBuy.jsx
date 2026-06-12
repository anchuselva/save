import { useEffect, useState } from "react";
import api from "../services/api";
import { categories } from "../utils/budgetUtils";
import { formatLKR } from "../utils/currencyFormatter";

export default function BudgetBeforeBuy() {
  const [form, setForm] = useState({ item_name: "", purchase_price: "", category: "Shopping" });
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = () =>
    api.get("/purchase-check")
      .then((r) => setHistory(r.data))
      .catch(() => setError("Could not load previous purchase checks."));

  useEffect(() => { load(); }, []);

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!form.item_name.trim()) return setError("Item name is required.");
    if (!form.purchase_price || Number(form.purchase_price) <= 0) return setError("Purchase price must be greater than 0.");

    setLoading(true);
    try {
      const { data } = await api.post("/purchase-check", form);
      setResult(data);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not check this purchase.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1>Budget Before You Buy</h1>
      <div className="row g-3">
        <div className="col-lg-5">
          <form className="app-card p-3" onSubmit={submit}>
            {error && <div className="alert alert-danger">{error}</div>}
            <input className="form-control mb-3" value={form.item_name} required placeholder="Item name" onChange={(e) => setForm({ ...form, item_name: e.target.value })} />
            <input className="form-control mb-3" value={form.purchase_price} required type="number" min="1" placeholder="Purchase price" onChange={(e) => setForm({ ...form, purchase_price: e.target.value })} />
            <select className="form-select mb-3" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{categories.map((c) => <option key={c}>{c}</option>)}</select>
            <button className="btn btn-primary" disabled={loading}>{loading ? "Checking..." : "Check Purchase"}</button>
          </form>
        </div>
        <div className="col-lg-7">
          <div className="app-card p-3">
            {result ? <><h3>{result.result}</h3><p>{result.explanation}</p></> : <p className="text-secondary">Enter a purchase to check remaining category budget.</p>}
            <h5>Recent Checks</h5>
            {history.slice(0, 5).map((h) => <div className="border-top py-2" key={h.id}>{h.item_name} - {formatLKR(h.purchase_price)} <span className="badge text-bg-warning">{h.result}</span></div>)}
          </div>
        </div>
      </div>
    </>
  );
}
