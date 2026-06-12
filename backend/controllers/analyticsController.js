const pool = require("../config/db");

const currentMonth = () => new Date().toISOString().slice(0, 7);
const today = () => new Date().toISOString().slice(0, 10);

async function base(userId) {
  const month = currentMonth();
  const [[income]] = await pool.query("SELECT COALESCE(SUM(amount),0) total FROM incomes WHERE user_id=? AND DATE_FORMAT(date,'%Y-%m')=?", [userId, month]);
  const [[expense]] = await pool.query("SELECT COALESCE(SUM(amount),0) total FROM expenses WHERE user_id=? AND DATE_FORMAT(date,'%Y-%m')=?", [userId, month]);
  const [categorySpending] = await pool.query(
    "SELECT category, COALESCE(SUM(amount),0) total FROM expenses WHERE user_id=? AND DATE_FORMAT(date,'%Y-%m')=? GROUP BY category ORDER BY total DESC",
    [userId, month]
  );
  const [budgets] = await pool.query(
    `SELECT b.category, b.allocated_budget, COALESCE(SUM(e.amount),0) spent
     FROM budgets b LEFT JOIN expenses e ON e.user_id=b.user_id AND e.category=b.category AND DATE_FORMAT(e.date,'%Y-%m')=b.month
     WHERE b.user_id=? AND b.month=? GROUP BY b.id`,
    [userId, month]
  );
  const [reminders] = await pool.query("SELECT * FROM reminders WHERE user_id=? ORDER BY due_date ASC", [userId]);
  const [[dailyLimit]] = await pool.query("SELECT * FROM daily_limits WHERE user_id=? ORDER BY id DESC LIMIT 1", [userId]);
  const [[todaySpent]] = await pool.query("SELECT COALESCE(SUM(amount),0) total FROM expenses WHERE user_id=? AND date=?", [userId, today()]);
  return { income: Number(income.total), expense: Number(expense.total), categorySpending, budgets, reminders, dailyLimit, todaySpent: Number(todaySpent.total) };
}

function budgetSummary(budgets) {
  return budgets.map((b) => {
    const allocated = Number(b.allocated_budget);
    const spent = Number(b.spent);
    const usage = allocated ? (spent / allocated) * 100 : 0;
    const risk = usage >= 100 ? "Overspent" : usage >= 90 ? "High Risk" : usage >= 70 ? "Caution" : "Safe";
    return { ...b, remaining: allocated - spent, usage, risk, suggestion: usage >= 100 ? `Reduce ${b.category} spending or reallocate budget.` : "" };
  });
}

async function health(userId) {
  const data = await base(userId);
  const budgets = budgetSummary(data.budgets);
  const overdue = data.reminders.filter((r) => r.status !== "Paid" && new Date(r.due_date) < new Date(today()));
  const savings = data.income - data.expense;
  const savingsRate = data.income ? (savings / data.income) * 100 : 0;
  const dailyExceeded = data.dailyLimit && data.todaySpent > Number(data.dailyLimit.limit_amount);
  let score = 100;
  const reasons = [];
  if (data.expense > data.income) { score -= 15; reasons.push("Monthly expenses are greater than income."); }
  budgets.filter((b) => b.risk === "Overspent").forEach((b) => { score -= 10; reasons.push(`${b.category} budget is overspent.`); });
  overdue.forEach((r) => { score -= 5; reasons.push(`${r.bill_type} is overdue.`); });
  if (savingsRate < 10) { score -= 10; reasons.push("Savings rate is below 10%."); }
  if (dailyExceeded) { score -= 5; reasons.push("Daily spending limit is exceeded."); }
  score = Math.max(0, score);
  const status = score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Needs Improvement" : "Critical";
  return { score, status, reasons, suggestions: reasons.length ? ["Prioritize overdue bills.", "Review overspent categories.", "Move small recurring costs into a weekly cap."] : ["Keep your savings habit consistent."] };
}

exports.dashboard = async (req, res) => {
  try {
    const data = await base(req.user.id);
    const budgets = budgetSummary(data.budgets);
    const healthScore = await health(req.user.id);
    const [recent] = await pool.query("SELECT * FROM expenses WHERE user_id=? ORDER BY date DESC, id DESC LIMIT 8", [req.user.id]);
    res.json({
      total_income: data.income,
      total_expenses: data.expense,
      savings: data.income - data.expense,
      financial_health: healthScore,
      daily: { limit: data.dailyLimit?.limit_amount || 0, spent: data.todaySpent },
      budget_summary: budgets,
      overspending_alerts: budgets.filter((b) => b.risk === "Overspent" || b.risk === "High Risk"),
      upcoming_bills: data.reminders.filter((r) => r.status !== "Paid").slice(0, 5),
      cash_leakage_warning: await cashLeakageData(req.user.id),
      recent_transactions: recent,
      category_spending: data.categorySpending
    });
  } catch (error) {
    res.status(500).json({ message: "Dashboard analytics failed", error: error.message });
  }
};

exports.reports = async (req, res) => {
  try {
    const data = await base(req.user.id);
    const [monthly] = await pool.query(
      "SELECT DATE_FORMAT(date,'%Y-%m') month, COALESCE(SUM(amount),0) expenses FROM expenses WHERE user_id=? GROUP BY month ORDER BY month",
      [req.user.id]
    );
    res.json({ ...data, budget_summary: budgetSummary(data.budgets), monthly_spending: monthly });
  } catch (error) {
    res.status(500).json({ message: "Reports analytics failed", error: error.message });
  }
};

exports.financialHealth = async (req, res) => {
  try {
    res.json(await health(req.user.id));
  } catch (error) {
    res.status(500).json({ message: "Financial health calculation failed", error: error.message });
  }
};

async function cashLeakageData(userId) {
  const [rows] = await pool.query(
    `SELECT category, COUNT(*) count, COALESCE(SUM(amount),0) total
     FROM expenses
     WHERE user_id=? AND amount <= 500 AND date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
     GROUP BY category ORDER BY count DESC, total DESC`,
    [userId]
  );
  const top = rows[0];
  return top && top.count > 5
    ? { warning: true, count: top.count, total: Number(top.total), category: top.category, suggestion: `Set a weekly mini-budget for ${top.category}.` }
    : { warning: false, count: 0, total: 0, category: null, suggestion: "No frequent small-expense leakage detected this week." };
}

exports.cashLeakage = async (req, res) => {
  try {
    res.json(await cashLeakageData(req.user.id));
  } catch (error) {
    res.status(500).json({ message: "Cash leakage calculation failed", error: error.message });
  }
};
