const express = require ('express')
const router = express.Router();
const questionController = require('../../controllers/admin/questionController');
const upload = require('../../middleware/uploadQuestion')
router.get('/',questionController.getAllQuestions)
router.get('/position/:positionId',questionController.getQuestionsByPosition)
router.get('/:id',questionController.getQuestionById)
// router.post('/',questionController.createQuestion)       
router.post('/',upload.fields([{ name: 'questionImage', maxCount: 1 },
                      { name: 'optionImages', maxCount: 4 } // Allow up to 4 option images
  ]),questionController.createQuestion);
router.put('/:id',upload.fields([{ name: 'questionImage', maxCount: 1 },
                      { name: 'optionImages', maxCount: 4 } // Allow up to 4 option images
  ]),questionController.updateQuestion)
router.delete('/:id',questionController.deleteQuestion)
router.get("/random/:positionId", questionController.getRandomQuestionsByPosition);

module.exports=router