const express = require("express");
const router = express.Router();
const PositionController = require('../../controllers/admin/positionController')

router.post("/",   PositionController.addPosition);
router.get("/", PositionController.getPositions);
router.post("/question-counts", PositionController.getQuestionCounts);
router.get("/:id", PositionController.getPositionById);
router.put("/:id", PositionController.updatePosition);
router.delete("/:id", PositionController.deletePosition);

module.exports=router