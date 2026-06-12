const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const c = require("../controllers/analyticsController");
router.use(auth);
router.get("/dashboard", c.dashboard);
router.get("/reports", c.reports);
router.get("/financial-health", c.financialHealth);
router.get("/cash-leakage", c.cashLeakage);
module.exports = router;
