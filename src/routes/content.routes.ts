import express from 'express';
import {
  createContentController,
  getContentByIdController,
  getAllContentController,
  getContentByCourseIdController,
  deleteContentByIdController,
  createPartModelController,
  addContentToPartModelController,
  getContentPartController,
  deletePartModelController,
  updateContentInPartModelController,
  deleteAssignmentQuestionByIdController,
  deleteQuizQuestionByIdController,
  updateAssignmentQuestionByIdController,
  updateQuizQuestionByIdController,
  addQuizQuestionController,
  addAssignmentQuestionController,
} from '../controller/content.controller';
import { authorizeRoles, isAuthenticated } from '../middleware/auth';

const router = express.Router();

router.get('/', getAllContentController);
router.get('/:contentId', getContentByIdController);
router.get('/course/:courseId/content', getContentByCourseIdController);
router.post('/:courseId', createContentController);
router.delete('/:contentId', deleteContentByIdController);
router.post('/:contentId/part', createPartModelController);
router.post(
  '/:contentId/part/:partId/content',
  addContentToPartModelController,
);
router.get('/:contentId/part/:partId', getContentPartController);
router.delete('/:contentId/part/:partId', deletePartModelController);
router.put('/:contentId/part/:partId', updateContentInPartModelController);
router.delete(
  '/:contentId/assignment/:questionId',
  deleteAssignmentQuestionByIdController,
);
router.delete('/:contentId/quiz/:questionId', deleteQuizQuestionByIdController);
router.put(
  '/:contentId/assignment/:questionId',
  updateAssignmentQuestionByIdController,
);
router.put('/:contentId/quiz/:questionId', updateQuizQuestionByIdController);
router.post('/:contentId/quiz', addQuizQuestionController);
router.post('/:contentId/assignment', addAssignmentQuestionController);

export default router;
