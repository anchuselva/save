# SaveLKR

SaveLKR is a Sri Lankan multilingual personal budgeting web app built with React, Bootstrap 5, Express, JWT auth, bcrypt, MySQL, Tesseract.js OCR, Chart.js, and the browser SpeechSynthesis API.

## Full Folder Structure

```text
backend/
  config/db.js
  controllers/
  database/schema.sql
  database/seed.sql
  middleware/authMiddleware.js
  routes/
  server.js
  package.json
  .env.example
frontend/
  src/
    components/
    pages/
      shared/CrudPage.jsx
    services/
    utils/
    App.jsx
    main.jsx
    styles.css
  index.html
  package.json
README.md
```

## Backend Setup

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

The API runs on `http://localhost:5000`.

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app runs on `http://localhost:5173`.

## XAMPP / phpMyAdmin Database Setup

1. Start Apache and MySQL in XAMPP.
2. Open phpMyAdmin at `http://localhost/phpmyadmin`.
3. Import `backend/database/schema.sql`.
4. Import `backend/database/seed.sql`.
5. Confirm the database name is `savelkr_db`.

Demo login:

```text
Email: demo@savelkr.lk
Password: password123
```

## .env.example

```text
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=savelkr_db
JWT_SECRET=savelkr_secret_key
PORT=5000
```

Optional frontend API override:

```text
VITE_API_URL=http://localhost:5000/api
```
