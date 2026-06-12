const pool = require("../config/db");

exports.getAll = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM incomes WHERE user_id=? ORDER BY date DESC, id DESC", [req.user.id]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Could not load income records", error: error.message });
  }
};

exports.create = async (req, res) => {
  const { amount, source, date, description } = req.body;
  if (!amount || Number(amount) <= 0) return res.status(400).json({ message: "Income amount must be greater than 0" });
  if (!source) return res.status(400).json({ message: "Income source is required" });
  if (!date) return res.status(400).json({ message: "Income date is required" });

  try {
    const [result] = await pool.query(
      "INSERT INTO incomes (user_id, amount, source, date, description) VALUES (?, ?, ?, ?, ?)",
      [req.user.id, amount, source, date, description || ""]
    );
    res.status(201).json({ id: result.insertId, amount, source, date, description: description || "" });
  } catch (error) {
    res.status(500).json({ message: "Could not add income", error: error.message });
  }
};

exports.update = async (req, res) => {
  const { amount, source, date, description } = req.body;
  if (!amount || Number(amount) <= 0) return res.status(400).json({ message: "Income amount must be greater than 0" });
  if (!source) return res.status(400).json({ message: "Income source is required" });
  if (!date) return res.status(400).json({ message: "Income date is required" });

  try {
    const [result] = await pool.query(
      "UPDATE incomes SET amount=?, source=?, date=?, description=? WHERE id=? AND user_id=?",
      [amount, source, date, description || "", req.params.id, req.user.id]
    );
    if (!result.affectedRows) return res.status(404).json({ message: "Income record not found" });
    res.json({ id: Number(req.params.id), amount, source, date, description: description || "" });
  } catch (error) {
    res.status(500).json({ message: "Could not update income", error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const [result] = await pool.query("DELETE FROM incomes WHERE id=? AND user_id=?", [req.params.id, req.user.id]);
    if (!result.affectedRows) return res.status(404).json({ message: "Income record not found" });
    res.json({ message: "Income deleted" });
  } catch (error) {
    res.status(500).json({ message: "Could not delete income", error: error.message });
  }
};
