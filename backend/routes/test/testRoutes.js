const express = require("express");
const router = express.Router()
const testController = require('../../controllers/test/testController')
const CandidateVid = require('../../middleware/candidateVideo')

router.post("/",CandidateVid.single('video'), testController.submitTest);

// Get all test results (HR/Admin)
router.get("/", testController.getAllResults);

// Get single candidate's results
router.get("/:candidateId", testController.getResultByCandidate);

// Fetch random questions for candidate (with shuffled options)
router.get("/questions/random", testController.getRandomQuestionsByPosition);
router.get("/result/:id", testController.getResultById);

module.exports=router