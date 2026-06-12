import { useEffect, useState } from "react";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import ChartCard from "../components/ChartCard";
import api from "../services/api";

export default function Reports() {
  const [data, setData] = useState(null);
  useEffect(() => { api.get("/analytics/reports").then((r) => setData(r.data)); }, []);
  if (!data) return <div>Loading reports...</div>;
  const cats = data.categorySpending || data.category_spending || [];
  return (
    <>
      <h1>Reports and Charts</h1>
      <div className="row g-3">
        <div className="col-lg-6"><ChartCard title="Income vs Expenses"><Bar data={{ labels: ["Income", "Expenses"], datasets: [{ label: "LKR", data: [data.income, data.expense], backgroundColor: ["#176b4d", "#7a1f2b"] }] }} /></ChartCard></div>
        <div className="col-lg-6"><ChartCard title="Planned Budget vs Actual Spending"><Bar data={{ labels: data.budget_summary.map((b) => b.category), datasets: [{ label: "Planned", data: data.budget_summary.map((b) => b.allocated_budget), backgroundColor: "#d6a329" }, { label: "Actual", data: data.budget_summary.map((b) => b.spent), backgroundColor: "#e76f2e" }] }} /></ChartCard></div>
        <div className="col-lg-4"><ChartCard title="Category-wise Expense Distribution"><Doughnut data={{ labels: cats.map((c) => c.category), datasets: [{ data: cats.map((c) => c.total), backgroundColor: ["#7a1f2b", "#d6a329", "#176b4d", "#e76f2e", "#56615f"] }] }} /></ChartCard></div>
        <div className="col-lg-4"><ChartCard title="Monthly Spending"><Line data={{ labels: data.monthly_spending.map((m) => m.month), datasets: [{ label: "Expenses", data: data.monthly_spending.map((m) => m.expenses), borderColor: "#7a1f2b", backgroundColor: "#7a1f2b" }] }} /></ChartCard></div>
        <div className="col-lg-4"><ChartCard title="Savings Summary"><Bar data={{ labels: ["Savings"], datasets: [{ label: "LKR", data: [data.income - data.expense], backgroundColor: "#176b4d" }] }} /></ChartCard></div>
      </div>
    </>
  );
}
