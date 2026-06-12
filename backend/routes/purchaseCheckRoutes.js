const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const c = require("../controllers/purchaseCheckController");
router.use(auth);
router.post("/", c.check);
router.get("/", c.getAll);
module.exports = router;
