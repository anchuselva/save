const pool = require("../config/db");

exports.getAll = async (req, res) => {
  const [rows] = await pool.query(
    `SELECT b.*, COALESCE(SUM(e.amount),0) current_spending
     FROM budgets b
     LEFT JOIN expenses e ON e.user_id=b.user_id AND e.category=b.category
       AND DATE_FORMAT(e.date,'%Y-%m')=b.month
     WHERE b.user_id=?
     GROUP BY b.id
     ORDER BY b.month DESC, b.category`,
    [req.user.id]
  );
  res.json(rows);
};

exports.create = async (req, res) => {
  const { category, month, allocated_budget } = req.body;
  const [result] = await pool.query(
    "INSERT INTO budgets (user_id, category, month, allocated_budget) VALUES (?, ?, ?, ?)",
    [req.user.id, category, month, allocated_budget]
  );
  res.status(201).json({ id: result.insertId, ...req.body });
};

exports.update = async (req, res) => {
  const { category, month, allocated_budget } = req.body;
  await pool.query(
    "UPDATE budgets SET category=?, month=?, allocated_budget=? WHERE id=? AND user_id=?",
    [category, month, allocated_budget, req.params.id, req.user.id]
  );
  res.json({ id: Number(req.params.id), ...req.body });
};

exports.remove = async (req, res) => {
  await pool.query("DELETE FROM budgets WHERE id=? AND user_id=?", [req.params.id, req.user.id]);
  res.json({ message: "Budget deleted" });
};
