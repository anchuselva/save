const pool = require("../config/db");

exports.getAll = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM expenses WHERE user_id=? ORDER BY date DESC, id DESC", [req.user.id]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Could not load expense records", error: error.message });
  }
};

exports.create = async (req, res) => {
  const { amount, category, date, description, merchant, payment_method } = req.body;
  if (!amount || Number(amount) <= 0) return res.status(400).json({ message: "Expense amount must be greater than 0" });
  if (!category) return res.status(400).json({ message: "Expense category is required" });
  if (!date) return res.status(400).json({ message: "Expense date is required" });

  try {
    const [result] = await pool.query(
      "INSERT INTO expenses (user_id, amount, category, date, description, merchant, payment_method) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [req.user.id, amount, category, date, description || "", merchant || "", payment_method || "Cash"]
    );
    res.status(201).json({ id: result.insertId, amount, category, date, description: description || "", merchant: merchant || "", payment_method: payment_method || "Cash" });
  } catch (error) {
    res.status(500).json({ message: "Could not add expense", error: error.message });
  }
};

exports.update = async (req, res) => {
  const { amount, category, date, description, merchant, payment_method } = req.body;
  if (!amount || Number(amount) <= 0) return res.status(400).json({ message: "Expense amount must be greater than 0" });
  if (!category) return res.status(400).json({ message: "Expense category is required" });
  if (!date) return res.status(400).json({ message: "Expense date is required" });

  try {
    const [result] = await pool.query(
      "UPDATE expenses SET amount=?, category=?, date=?, description=?, merchant=?, payment_method=? WHERE id=? AND user_id=?",
      [amount, category, date, description || "", merchant || "", payment_method || "Cash", req.params.id, req.user.id]
    );
    if (!result.affectedRows) return res.status(404).json({ message: "Expense record not found" });
    res.json({ id: Number(req.params.id), amount, category, date, description: description || "", merchant: merchant || "", payment_method: payment_method || "Cash" });
  } catch (error) {
    res.status(500).json({ message: "Could not update expense", error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const [result] = await pool.query("DELETE FROM expenses WHERE id=? AND user_id=?", [req.params.id, req.user.id]);
    if (!result.affectedRows) return res.status(404).json({ message: "Expense record not found" });
    res.json({ message: "Expense deleted" });
  } catch (error) {
    res.status(500).json({ message: "Could not delete expense", error: error.message });
  }
};
