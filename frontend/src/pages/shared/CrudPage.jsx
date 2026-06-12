import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import { riskLevel } from "../../utils/budgetUtils";
import { formatLKR } from "../../utils/currencyFormatter";

const today = new Date().toISOString().slice(0, 10);
const optionalFields = new Set(["description", "merchant"]);

export default function CrudPage({ title, endpoint, fields, budgetMode, reminderMode }) {
  const empty = Object.fromEntries(fields.map(([name, _label, type, opts]) => [name, type === "date" ? today : type === "month" ? today.slice(0, 7) : opts?.[0] || ""]));
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const load = () => {
    setError("");
    return api.get(endpoint)
      .then((r) => setRows(r.data))
      .catch((err) => {
        const text = err.response?.status === 401
          ? "Please login again before managing records."
          : err.response?.data?.message || "Could not load records.";
        setError(text);
      });
  };
  useEffect(() => {
    load();
  }, [endpoint]);

  const grouped = useMemo(() => {
    if (!reminderMode) return null;
    const now = new Date(today);
    return {
      Upcoming: rows.filter((r) => r.status !== "Paid" && new Date(r.due_date) >= now),
      Overdue: rows.filter((r) => r.status !== "Paid" && new Date(r.due_date) < now),
      Paid: rows.filter((r) => r.status === "Paid")
    };
  }, [rows, reminderMode]);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    for (const [name, label] of fields) {
      if (!optionalFields.has(name) && !String(form[name] || "").trim()) {
        setError(`${label} is required.`);
        return;
      }
      if ((name.includes("amount") || name.includes("budget")) && Number(form[name]) <= 0) {
        setError(`${label} must be greater than 0.`);
        return;
      }
    }
    setLoading(true);
    try {
      editing ? await api.put(`${endpoint}/${editing}`, form) : await api.post(endpoint, form);
      setEditing(null);
      setForm(empty);
      setMessage(editing ? "Record updated successfully." : "Record added successfully.");
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save record. Please check all fields.");
    } finally {
      setLoading(false);
    }
  }

  async function remove(id) {
    setError("");
    setMessage("");
    try {
      await api.delete(`${endpoint}/${id}`);
      setMessage("Record deleted successfully.");
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete record.");
    }
  }

  function edit(row) {
    setEditing(row.id);
    setForm(Object.fromEntries(fields.map(([name]) => [name, row[name]?.slice ? row[name].slice(0, name.includes("date") ? 10 : undefined) : row[name]])));
  }

  const table = (items) => (
    <div className="table-responsive">
      <table className="table align-middle">
        <thead><tr>{fields.map((f) => <th key={f[0]}>{f[1]}</th>)}{budgetMode && <><th>Current spending</th><th>Remaining</th><th>Usage</th><th>Risk level</th></>}<th></th></tr></thead>
        <tbody>{items.map((row) => {
          const risk = budgetMode ? riskLevel(row.current_spending, row.allocated_budget) : null;
          return <tr key={row.id}>{fields.map(([name]) => <td key={name}>{String(name).includes("amount") || name.includes("budget") ? formatLKR(row[name]) : String(row[name] || "").slice(0, 10)}</td>)}{budgetMode && <><td>{formatLKR(row.current_spending)}</td><td>{formatLKR(Number(row.allocated_budget) - Number(row.current_spending || 0))}</td><td>{Math.round(risk.usage)}%</td><td><span className={`badge ${risk.className}`}>{risk.label}</span>{risk.label === "Overspent" && <div className="small text-danger">Reduce spending or reallocate this month.</div>}</td></>}<td className="text-end"><button className="btn btn-sm btn-outline-primary me-2" onClick={() => edit(row)}>Edit</button><button className="btn btn-sm btn-outline-danger" onClick={() => remove(row.id)}>Delete</button></td></tr>;
        })}</tbody>
      </table>
    </div>
  );

  return (
    <>
      <h1>{title}</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}
      <div className="row g-3">
        <div className="col-lg-4">
          <form className="app-card p-3" onSubmit={submit}>
            <h5>{editing ? "Update" : "Add"} Record</h5>
            {fields.map(([name, label, type, options]) => (
              <div className="mb-3" key={name}>
                <label className="form-label">{label}</label>
                {type === "select" ? <select className="form-select" value={form[name] || ""} onChange={(e) => setForm({ ...form, [name]: e.target.value })}>{options.map((o) => <option key={o}>{o}</option>)}</select> : <input className="form-control" type={type} min={type === "number" ? "1" : undefined} value={form[name] || ""} onChange={(e) => setForm({ ...form, [name]: e.target.value })} required={!optionalFields.has(name)} />}
              </div>
            ))}
            <button className="btn btn-primary w-100" disabled={loading}>{loading ? "Saving..." : editing ? "Save Changes" : "Add"}</button>
            {editing && <button className="btn btn-outline-primary w-100 mt-2" type="button" onClick={() => { setEditing(null); setForm(empty); }}>Cancel</button>}
          </form>
        </div>
        <div className="col-lg-8">
          <div className="app-card p-3">
            {reminderMode ? Object.entries(grouped).map(([label, items]) => <div key={label} className="mb-4"><h5>{label} reminders</h5>{table(items)}</div>) : table(rows)}
          </div>
        </div>
      </div>
    </>
  );
}
