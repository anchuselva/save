const pool = require("../config/db");

exports.getAll = async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM reminders WHERE user_id=? ORDER BY due_date ASC", [req.user.id]);
  res.json(rows);
};

exports.create = async (req, res) => {
  const { bill_type, amount, due_date, description, status = "Pending" } = req.body;
  const [result] = await pool.query(
    "INSERT INTO reminders (user_id, bill_type, amount, due_date, description, status) VALUES (?, ?, ?, ?, ?, ?)",
    [req.user.id, bill_type, amount, due_date, description, status]
  );
  res.status(201).json({ id: result.insertId, ...req.body });
};

exports.update = async (req, res) => {
  const { bill_type, amount, due_date, description, status } = req.body;
  await pool.query(
    "UPDATE reminders SET bill_type=?, amount=?, due_date=?, description=?, status=? WHERE id=? AND user_id=?",
    [bill_type, amount, due_date, description, status, req.params.id, req.user.id]
  );
  res.json({ id: Number(req.params.id), ...req.body });
};

exports.remove = async (req, res) => {
  await pool.query("DELETE FROM reminders WHERE id=? AND user_id=?", [req.params.id, req.user.id]);
  res.json({ message: "Reminder deleted" });
};
