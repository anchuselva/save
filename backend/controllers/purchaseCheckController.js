const pool = require("../config/db");

async function remainingBudget(userId, category) {
  const month = new Date().toISOString().slice(0, 7);
  const [[budget]] = await pool.query(
    "SELECT allocated_budget FROM budgets WHERE user_id=? AND category=? AND month=? ORDER BY id DESC LIMIT 1",
    [userId, category, month]
  );
  const [[spent]] = await pool.query(
    "SELECT COALESCE(SUM(amount),0) total FROM expenses WHERE user_id=? AND category=? AND DATE_FORMAT(date,'%Y-%m')=?",
    [userId, category, month]
  );
  return Number(budget?.allocated_budget || 0) - Number(spent.total || 0);
}

exports.check = async (req, res) => {
  const { item_name, purchase_price, category } = req.body;
  const remaining = await remainingBudget(req.user.id, category);
  const price = Number(purchase_price);
  let result = "Not Recommended";
  if (price <= remaining * 0.5) result = "Safe to Buy";
  else if (price <= remaining) result = "Risky Purchase";
  const overBy = Math.max(price - remaining, 0);
  const explanation = overBy
    ? `You have LKR ${remaining.toLocaleString()} remaining in ${category}. Buying this item will exceed your budget by LKR ${overBy.toLocaleString()}.`
    : `You have LKR ${remaining.toLocaleString()} remaining in ${category}. This purchase would leave LKR ${(remaining - price).toLocaleString()}.`;

  const [saved] = await pool.query(
    "INSERT INTO purchase_checks (user_id, item_name, purchase_price, category, remaining_budget, result, explanation) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [req.user.id, item_name, purchase_price, category, remaining, result, explanation]
  );
  res.status(201).json({ id: saved.insertId, item_name, purchase_price, category, remaining_budget: remaining, result, explanation });
};

exports.getAll = async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM purchase_checks WHERE user_id=? ORDER BY created_at DESC", [req.user.id]);
  res.json(rows);
};
