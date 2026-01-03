const express = require("express");
const router = express.Router();
const upload = require("../../middleware/uploadhrImages");
const {addHr,editHr,deleteHr,getHrById,getHrs} =require('../../controllers/admin/HrController')
const DashboardController = require("../../controllers/admin/AdminDashboardController");
router.post("/", upload.single("image"), addHr);
router.get("/", getHrs);
router.get("/hr/:id", getHrById);
router.put("/hr/:id", upload.single("image"), editHr);
router.get('/dashboard',DashboardController.getDashboardStats)
router.delete("/hr/:id", deleteHr);
module.exports=router