const pool = require("../config/db");

exports.getAll = async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM receipts WHERE user_id=? ORDER BY receipt_date DESC", [req.user.id]);
  res.json(rows);
};

exports.checkDuplicate = async (req, res) => {
  const { merchant, date, amount } = req.body;
  const [rows] = await pool.query(
    "SELECT id FROM expenses WHERE user_id=? AND LOWER(merchant)=LOWER(?) AND date=? AND amount=? LIMIT 1",
    [req.user.id, merchant, date, amount]
  );
  res.json({
    duplicate: rows.length > 0,
    message: rows.length ? "Possible duplicate bill detected. A similar bill was already added." : "No duplicate found"
  });
};

exports.create = async (req, res) => {
  const { merchant, receipt_date, amount, category, raw_text } = req.body;
  const [receipt] = await pool.query(
    "INSERT INTO receipts (user_id, merchant, receipt_date, amount, category, raw_text) VALUES (?, ?, ?, ?, ?, ?)",
    [req.user.id, merchant, receipt_date, amount, category, raw_text]
  );
  const [expense] = await pool.query(
    "INSERT INTO expenses (user_id, amount, category, date, description, merchant, payment_method) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [req.user.id, amount, category, receipt_date, "Scanned bill", merchant, "Card/Cash"]
  );
  res.status(201).json({ receipt_id: receipt.insertId, expense_id: expense.insertId });
};
