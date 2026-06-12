const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const c = require("../controllers/receiptController");
router.use(auth);
router.get("/", c.getAll);
router.post("/", c.create);
router.post("/check-duplicate", c.checkDuplicate);
module.exports = router;
