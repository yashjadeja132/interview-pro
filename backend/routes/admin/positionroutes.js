const express = require("express");
const router = express.Router();
const PositionController = require('../../controllers/admin/positionController')

router.post("/",   PositionController.addPosition);
router.get("/", PositionController.getPositions);
router.get("/:id", PositionController.getPositionById);
router.put("/:id", PositionController.updatePosition);
router.delete("/:id", PositionController.deletePosition);

module.exports=router