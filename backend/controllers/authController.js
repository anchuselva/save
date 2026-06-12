const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const allowedLanguages = new Set(["English", "Sinhala", "Tamil"]);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const signToken = (user) =>
  jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || "savelkr_secret_key", {
    expiresIn: "7d"
  });

function normalizeEmail(email = "") {
  return String(email).trim().toLowerCase();
}

function cleanUser(user) {
  return {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    preferred_language: user.preferred_language || "English",
    voice_language: user.voice_language || user.preferred_language || "English",
    created_at: user.created_at
  };
}

function validateAuthInput({ full_name, email, password, confirm, preferred_language }, isRegister = false) {
  const normalizedEmail = normalizeEmail(email);
  const language = allowedLanguages.has(preferred_language) ? preferred_language : "English";

  if (isRegister && !String(full_name || "").trim()) return { error: "Full name is required" };
  if (!normalizedEmail) return { error: "Email is required" };
  if (!emailPattern.test(normalizedEmail)) return { error: "Please enter a valid email address" };
  if (!password) return { error: "Password is required" };
  if (isRegister && password.length < 8) return { error: "Password must be at least 8 characters" };
  if (isRegister && confirm !== undefined && password !== confirm) return { error: "Passwords do not match" };

  return {
    full_name: String(full_name || "").trim(),
    email: normalizedEmail,
    password,
    preferred_language: language
  };
}

exports.register = async (req, res) => {
  const input = validateAuthInput(req.body, true);
  if (input.error) return res.status(400).json({ message: input.error });

  try {
    const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [input.email]);
    if (existing.length) return res.status(409).json({ message: "Email already registered" });

    const password_hash = await bcrypt.hash(input.password, 10);
    const [result] = await pool.query(
      "INSERT INTO users (full_name, email, password_hash, preferred_language, voice_language) VALUES (?, ?, ?, ?, ?)",
      [input.full_name, input.email, password_hash, input.preferred_language, input.preferred_language]
    );
    const user = cleanUser({ id: result.insertId, ...input, voice_language: input.preferred_language });
    res.status(201).json({ user, token: signToken(user) });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") return res.status(409).json({ message: "Email already registered" });
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
};

exports.login = async (req, res) => {
  const input = validateAuthInput(req.body, false);
  if (input.error) return res.status(400).json({ message: input.error });

  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [input.email]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(input.password, user.password_hash))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const safeUser = cleanUser(user);
    res.json({ user: safeUser, token: signToken(safeUser) });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

exports.profile = async (req, res) => {
  const [rows] = await pool.query(
    "SELECT id, full_name, email, preferred_language, voice_language, created_at FROM users WHERE id = ?",
    [req.user.id]
  );
  res.json(rows[0]);
};

exports.updateProfile = async (req, res) => {
  const full_name = String(req.body.full_name || "").trim();
  const email = normalizeEmail(req.body.email);
  const preferred_language = allowedLanguages.has(req.body.preferred_language) ? req.body.preferred_language : "English";
  const voice_language = allowedLanguages.has(req.body.voice_language) ? req.body.voice_language : preferred_language;
  const { password } = req.body;

  if (!full_name) return res.status(400).json({ message: "Full name is required" });
  if (!emailPattern.test(email)) return res.status(400).json({ message: "Please enter a valid email address" });
  if (password && password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters" });

  try {
    const [existing] = await pool.query("SELECT id FROM users WHERE email=? AND id<>?", [email, req.user.id]);
    if (existing.length) return res.status(409).json({ message: "Email already used by another account" });

    if (password) {
      const hash = await bcrypt.hash(password, 10);
      await pool.query(
        "UPDATE users SET full_name=?, email=?, preferred_language=?, voice_language=?, password_hash=? WHERE id=?",
        [full_name, email, preferred_language, voice_language, hash, req.user.id]
      );
    } else {
      await pool.query(
        "UPDATE users SET full_name=?, email=?, preferred_language=?, voice_language=? WHERE id=?",
        [full_name, email, preferred_language, voice_language, req.user.id]
      );
    }
    exports.profile(req, res);
  } catch (error) {
    res.status(500).json({ message: "Profile update failed", error: error.message });
  }
};
