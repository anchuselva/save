const pool = require("../config/db");
const bcrypt = require("bcryptjs");

async function columnExists(table, column) {
  const [rows] = await pool.query(
    `SELECT COUNT(*) count
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [table, column]
  );
  return Number(rows[0].count) > 0;
}

async function indexExists(table, indexName) {
  const [rows] = await pool.query(
    `SELECT COUNT(*) count
     FROM INFORMATION_SCHEMA.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ?`,
    [table, indexName]
  );
  return Number(rows[0].count) > 0;
}

async function ensureColumn(table, column, definition) {
  if (!(await columnExists(table, column))) {
    await pool.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

async function ensureUsersTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      full_name VARCHAR(120) NOT NULL,
      email VARCHAR(160) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      preferred_language ENUM('English','Sinhala','Tamil') DEFAULT 'English',
      voice_language ENUM('English','Sinhala','Tamil') DEFAULT 'English',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await ensureColumn("users", "full_name", "VARCHAR(120) NOT NULL DEFAULT '' AFTER id");
  await ensureColumn("users", "email", "VARCHAR(160) NOT NULL AFTER full_name");
  await ensureColumn("users", "password_hash", "VARCHAR(255) NOT NULL AFTER email");
  await ensureColumn("users", "preferred_language", "ENUM('English','Sinhala','Tamil') DEFAULT 'English' AFTER password_hash");
  await ensureColumn("users", "voice_language", "ENUM('English','Sinhala','Tamil') DEFAULT 'English' AFTER preferred_language");
  await ensureColumn("users", "created_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
  await ensureColumn("users", "updated_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
  if (!(await indexExists("users", "email"))) await pool.query("ALTER TABLE users ADD UNIQUE KEY email (email)");
}

async function ensureSchema() {
  await ensureUsersTable();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS incomes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      amount DECIMAL(12,2) NOT NULL,
      source VARCHAR(80) NOT NULL,
      date DATE NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  await ensureColumn("incomes", "user_id", "INT NOT NULL DEFAULT 1");
  await ensureColumn("incomes", "amount", "DECIMAL(12,2) NOT NULL DEFAULT 0");
  await ensureColumn("incomes", "source", "VARCHAR(80) NOT NULL DEFAULT 'Other income'");
  await ensureColumn("incomes", "date", "DATE");
  await ensureColumn("incomes", "description", "TEXT");
  await ensureColumn("incomes", "created_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
  await ensureColumn("incomes", "updated_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      amount DECIMAL(12,2) NOT NULL,
      category VARCHAR(60) NOT NULL,
      date DATE NOT NULL,
      description TEXT,
      merchant VARCHAR(120),
      payment_method VARCHAR(60),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  await ensureColumn("expenses", "user_id", "INT NOT NULL DEFAULT 1");
  await ensureColumn("expenses", "amount", "DECIMAL(12,2) NOT NULL DEFAULT 0");
  await ensureColumn("expenses", "category", "VARCHAR(60) NOT NULL DEFAULT 'Miscellaneous'");
  await ensureColumn("expenses", "date", "DATE");
  await ensureColumn("expenses", "description", "TEXT");
  await ensureColumn("expenses", "merchant", "VARCHAR(120)");
  await ensureColumn("expenses", "payment_method", "VARCHAR(60)");
  await ensureColumn("expenses", "created_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
  await ensureColumn("expenses", "updated_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS budgets (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      category VARCHAR(60) NOT NULL,
      month CHAR(7) NOT NULL,
      allocated_budget DECIMAL(12,2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_budget (user_id, category, month),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  await ensureColumn("budgets", "user_id", "INT NOT NULL DEFAULT 1");
  await ensureColumn("budgets", "category", "VARCHAR(60) NOT NULL DEFAULT 'Miscellaneous'");
  await ensureColumn("budgets", "month", "CHAR(7) NOT NULL DEFAULT '2026-05'");
  await ensureColumn("budgets", "allocated_budget", "DECIMAL(12,2) NOT NULL DEFAULT 0");
  await ensureColumn("budgets", "created_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
  await ensureColumn("budgets", "updated_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS reminders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      bill_type VARCHAR(80) NOT NULL,
      amount DECIMAL(12,2) NOT NULL,
      due_date DATE NOT NULL,
      description TEXT,
      status ENUM('Pending','Paid') DEFAULT 'Pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  await ensureColumn("reminders", "user_id", "INT NOT NULL DEFAULT 1");
  await ensureColumn("reminders", "bill_type", "VARCHAR(80) NOT NULL DEFAULT 'Bill'");
  await ensureColumn("reminders", "amount", "DECIMAL(12,2) NOT NULL DEFAULT 0");
  await ensureColumn("reminders", "due_date", "DATE");
  await ensureColumn("reminders", "description", "TEXT");
  await ensureColumn("reminders", "status", "ENUM('Pending','Paid') DEFAULT 'Pending'");
  await ensureColumn("reminders", "created_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
  await ensureColumn("reminders", "updated_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS receipts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      merchant VARCHAR(120),
      receipt_date DATE,
      amount DECIMAL(12,2),
      category VARCHAR(60),
      raw_text LONGTEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  await ensureColumn("receipts", "user_id", "INT NOT NULL DEFAULT 1");
  await ensureColumn("receipts", "merchant", "VARCHAR(120)");
  await ensureColumn("receipts", "receipt_date", "DATE");
  await ensureColumn("receipts", "amount", "DECIMAL(12,2)");
  await ensureColumn("receipts", "category", "VARCHAR(60)");
  await ensureColumn("receipts", "raw_text", "LONGTEXT");
  await ensureColumn("receipts", "created_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
  await ensureColumn("receipts", "updated_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS daily_limits (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      limit_amount DECIMAL(12,2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  await ensureColumn("daily_limits", "user_id", "INT NOT NULL DEFAULT 1");
  await ensureColumn("daily_limits", "limit_amount", "DECIMAL(12,2) NOT NULL DEFAULT 0");
  await ensureColumn("daily_limits", "created_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
  await ensureColumn("daily_limits", "updated_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS purchase_checks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      item_name VARCHAR(120) NOT NULL,
      purchase_price DECIMAL(12,2) NOT NULL,
      category VARCHAR(60) NOT NULL,
      remaining_budget DECIMAL(12,2) NOT NULL,
      result VARCHAR(40) NOT NULL,
      explanation TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  await ensureColumn("purchase_checks", "user_id", "INT NOT NULL DEFAULT 1");
  await ensureColumn("purchase_checks", "item_name", "VARCHAR(120) NOT NULL DEFAULT 'Item'");
  await ensureColumn("purchase_checks", "purchase_price", "DECIMAL(12,2) NOT NULL DEFAULT 0");
  await ensureColumn("purchase_checks", "category", "VARCHAR(60) NOT NULL DEFAULT 'Miscellaneous'");
  await ensureColumn("purchase_checks", "remaining_budget", "DECIMAL(12,2) NOT NULL DEFAULT 0");
  await ensureColumn("purchase_checks", "result", "VARCHAR(40) NOT NULL DEFAULT 'Not Recommended'");
  await ensureColumn("purchase_checks", "explanation", "TEXT");
  await ensureColumn("purchase_checks", "created_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
  await ensureColumn("purchase_checks", "updated_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS financial_scores (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      score INT NOT NULL,
      status VARCHAR(40) NOT NULL,
      reasons TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  await ensureColumn("financial_scores", "user_id", "INT NOT NULL DEFAULT 1");
  await ensureColumn("financial_scores", "score", "INT NOT NULL DEFAULT 100");
  await ensureColumn("financial_scores", "status", "VARCHAR(40) NOT NULL DEFAULT 'Excellent'");
  await ensureColumn("financial_scores", "reasons", "TEXT");
  await ensureColumn("financial_scores", "created_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
  await ensureColumn("financial_scores", "updated_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");

  const demoHash = await bcrypt.hash("password123", 10);
  await pool.query(
    `INSERT INTO users (full_name, email, password_hash, preferred_language, voice_language)
     VALUES ('Demo User', 'demo@savelkr.lk', ?, 'English', 'English')
     ON DUPLICATE KEY UPDATE
       full_name = VALUES(full_name),
       password_hash = VALUES(password_hash),
       preferred_language = VALUES(preferred_language),
       voice_language = VALUES(voice_language)`,
    [demoHash]
  );
}

module.exports = ensureSchema;
