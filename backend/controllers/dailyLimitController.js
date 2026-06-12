const pool = require("../config/db");

exports.get = async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM daily_limits WHERE user_id=? ORDER BY id DESC LIMIT 1", [req.user.id]);
  res.json(rows[0] || null);
};

exports.create = async (req, res) => {
  const { limit_amount } = req.body;
  const [result] = await pool.query("INSERT INTO daily_limits (user_id, limit_amount) VALUES (?, ?)", [req.user.id, limit_amount]);
  res.status(201).json({ id: result.insertId, limit_amount });
};

exports.update = async (req, res) => {
  await pool.query("UPDATE daily_limits SET limit_amount=? WHERE id=? AND user_id=?", [req.body.limit_amount, req.params.id, req.user.id]);
  res.json({ id: Number(req.params.id), limit_amount: req.body.limit_amount });
};
