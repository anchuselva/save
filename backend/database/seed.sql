USE savelkr_db;

INSERT INTO users (id, full_name, email, password_hash, preferred_language, voice_language)
VALUES (1, 'Demo User', 'demo@savelkr.lk', '$2a$10$iL.I3wuR1rDGCVUg8IBpI.A4S4Cv3dJqGHnjQ8zrm3IBxndkY84Cy', 'English', 'English')
ON DUPLICATE KEY UPDATE email = VALUES(email);

INSERT INTO incomes (user_id, amount, source, date, description) VALUES
(1, 185000.00, 'Salary', CURDATE(), 'Monthly salary'),
(1, 25000.00, 'Freelance', DATE_SUB(CURDATE(), INTERVAL 4 DAY), 'Website update project'),
(1, 12000.00, 'Business income', DATE_SUB(CURDATE(), INTERVAL 8 DAY), 'Weekend sales');

INSERT INTO expenses (user_id, amount, category, date, description, merchant, payment_method) VALUES
(1, 8500.00, 'Food', CURDATE(), 'Monthly groceries', 'Cargills Food City', 'Card'),
(1, 420.00, 'Food', DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'Short eats', 'Local Bakery', 'Cash'),
(1, 360.00, 'Food', DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'Tea and snacks', 'Cafe', 'Cash'),
(1, 480.00, 'Food', DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'Lunch packet', 'Rice Shop', 'Cash'),
(1, 450.00, 'Food', DATE_SUB(CURDATE(), INTERVAL 4 DAY), 'Dinner', 'Kottu Spot', 'Cash'),
(1, 390.00, 'Food', DATE_SUB(CURDATE(), INTERVAL 5 DAY), 'Breakfast', 'Hela Cafe', 'Cash'),
(1, 500.00, 'Food', DATE_SUB(CURDATE(), INTERVAL 6 DAY), 'Fruit juice', 'Juice Bar', 'Cash'),
(1, 6500.00, 'Transport', DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'Fuel and PickMe rides', 'PickMe', 'Card'),
(1, 14300.00, 'Electricity', DATE_SUB(CURDATE(), INTERVAL 6 DAY), 'CEB bill', 'CEB', 'Online'),
(1, 5200.00, 'Phone', DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'Mobile and data package', 'Dialog', 'Online'),
(1, 22000.00, 'Shopping', DATE_SUB(CURDATE(), INTERVAL 9 DAY), 'Clothing purchase', 'Odel', 'Card'),
(1, 18000.00, 'Education', DATE_SUB(CURDATE(), INTERVAL 12 DAY), 'Course fee', 'Learning Center', 'Bank Transfer');

INSERT INTO budgets (user_id, category, month, allocated_budget) VALUES
(1, 'Food', DATE_FORMAT(CURDATE(), '%Y-%m'), 18000.00),
(1, 'Transport', DATE_FORMAT(CURDATE(), '%Y-%m'), 16000.00),
(1, 'Electricity', DATE_FORMAT(CURDATE(), '%Y-%m'), 12000.00),
(1, 'Phone', DATE_FORMAT(CURDATE(), '%Y-%m'), 7000.00),
(1, 'Shopping', DATE_FORMAT(CURDATE(), '%Y-%m'), 20000.00),
(1, 'Education', DATE_FORMAT(CURDATE(), '%Y-%m'), 25000.00),
(1, 'Health', DATE_FORMAT(CURDATE(), '%Y-%m'), 10000.00);

INSERT INTO reminders (user_id, bill_type, amount, due_date, description, status) VALUES
(1, 'Water bill', 2200.00, DATE_ADD(CURDATE(), INTERVAL 4 DAY), 'NWSDB monthly bill', 'Pending'),
(1, 'Internet bill', 6500.00, DATE_ADD(CURDATE(), INTERVAL 8 DAY), 'Fiber connection', 'Pending'),
(1, 'Rent', 55000.00, DATE_ADD(CURDATE(), INTERVAL 10 DAY), 'Monthly apartment rent', 'Pending'),
(1, 'Phone bill', 5200.00, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'Already paid through app', 'Paid');

INSERT INTO receipts (user_id, merchant, receipt_date, amount, category, raw_text) VALUES
(1, 'Cargills Food City', CURDATE(), 8500.00, 'Food', 'Cargills Food City Total Rs. 8500.00');

INSERT INTO daily_limits (user_id, limit_amount) VALUES (1, 6500.00);

INSERT INTO purchase_checks (user_id, item_name, purchase_price, category, remaining_budget, result, explanation) VALUES
(1, 'Bluetooth speaker', 9500.00, 'Shopping', -2000.00, 'Not Recommended', 'You have LKR -2,000 remaining in Shopping. Buying this item will exceed your budget by LKR 11,500.');

INSERT INTO financial_scores (user_id, score, status, reasons) VALUES
(1, 75, 'Good', 'Shopping is overspent; Electricity is above budget.');
