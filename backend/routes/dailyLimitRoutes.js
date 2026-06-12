const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const c = require("../controllers/dailyLimitController");
router.use(auth);
router.get("/", c.get);
router.post("/", c.create);
router.put("/:id", c.update);
module.exports = router;
