const express = require('express');
const router = express.Router();
const {
  createTestAttempt,
  submitTestWithAttempt,
  getCandidateAttempts,
  getLatestAttempt,
  getAllResultsWithAttempts
} = require('../../controllers/test/testAttemptController');
const CandidateVid = require('../../middleware/candidateVideo');

// Create a new test attempt
router.post('/create', createTestAttempt);

// Submit test with attempt tracking
router.post('/submit', CandidateVid.single('recording'), submitTestWithAttempt);

// Get all attempts for a candidate-position combination
router.get('/candidate/:candidateId/position/:positionId', getCandidateAttempts);

// Get latest attempt for a candidate-position combination
router.get('/latest/:candidateId/position/:positionId', getLatestAttempt);

// Get all test results with attempt information (for admin/HR)
router.get('/results', getAllResultsWithAttempts);

module.exports = router;
