const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const controller = require("../controllers/authController");

router.post("/register", controller.register);
router.post("/login", controller.login);
router.get("/profile", auth, controller.profile);
router.put("/profile", auth, controller.updateProfile);

module.exports = router;
