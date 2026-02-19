const express = require ('express')
const router = express.Router();
const questionController = require('../../controllers/admin/questionController');
const upload = require('../../middleware/uploadQuestion')

router.get('/', questionController.getAllQuestions)
router.get('/subject/:subjectId', questionController.getQuestionsBySubject)
router.get('/:id', questionController.getQuestionById)

router.post('/', upload.fields([
    { name: 'questionImage', maxCount: 1 },
    { name: 'optionImages', maxCount: 4 }
]), questionController.createQuestion);

router.put('/:id', upload.fields([
    { name: 'questionImage', maxCount: 1 },
    { name: 'optionImages', maxCount: 4 }
]), questionController.updateQuestion)

router.delete('/:id', questionController.deleteQuestion)
router.get("/random/:subjectId", questionController.getRandomQuestionsBySubject);

module.exports = router