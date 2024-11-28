'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const express_1 = __importDefault(require('express'));
const content_controller_1 = require('../controller/content.controller');
const router = express_1.default.Router();
router.get('/', content_controller_1.getAllContentController);
router.get('/:contentId', content_controller_1.getContentByIdController);
router.get(
  '/course/:courseId/content',
  content_controller_1.getContentByCourseIdController,
);
router.post('/:courseId', content_controller_1.createContentController);
router.delete('/:contentId', content_controller_1.deleteContentByIdController);
router.post('/:contentId/part', content_controller_1.createPartModelController);
router.post(
  '/:contentId/part/:partId/content',
  content_controller_1.addContentToPartModelController,
);
router.get(
  '/:contentId/part/:partId',
  content_controller_1.getContentPartController,
);
router.delete(
  '/:contentId/part/:partId',
  content_controller_1.deletePartModelController,
);
router.put(
  '/:contentId/part/:partId',
  content_controller_1.updateContentInPartModelController,
);
router.delete(
  '/:contentId/assignment/:questionId',
  content_controller_1.deleteAssignmentQuestionByIdController,
);
router.delete(
  '/:contentId/quiz/:questionId',
  content_controller_1.deleteQuizQuestionByIdController,
);
router.put(
  '/:contentId/assignment/:questionId',
  content_controller_1.updateAssignmentQuestionByIdController,
);
router.put(
  '/:contentId/quiz/:questionId',
  content_controller_1.updateQuizQuestionByIdController,
);
router.post('/:contentId/quiz', content_controller_1.addQuizQuestionController);
router.post(
  '/:contentId/assignment',
  content_controller_1.addAssignmentQuestionController,
);
exports.default = router;
