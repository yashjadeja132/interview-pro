const express = require("express");
const router = express.Router();
const LoginTimeController = require("../../controllers/admin/logintimeController");
router.post("/", LoginTimeController.setLoginTime);
router.get("/", LoginTimeController.getLoginTime);
router.put("/", LoginTimeController.updateLoginTime);

module.exports = router;