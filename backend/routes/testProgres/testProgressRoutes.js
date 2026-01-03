const express = require('express');
const router = express.Router();
const {
  saveProgress,
  getProgress,
  resetProgress,
} = require('../../controllers/testProgress/testProgressController');

// POST → Save progress
router.post('/save', saveProgress);

// GET → Get saved progress for resume
router.get('/get/:candidateId/:positionId', getProgress);

// DELETE → Reset progress after submission (optional)
router.delete('/reset', resetProgress);

module.exports = router;
