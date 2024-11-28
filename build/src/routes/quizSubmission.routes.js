'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const express_1 = __importDefault(require('express'));
const quizSubmission_controller_1 = require('../controller/quizSubmission.controller');
const auth_1 = require('../middleware/auth');
const quizSubmissionRouter = express_1.default.Router();
// Get all quiz submissions
quizSubmissionRouter.get(
  '/all',
  auth_1.isAuthenticated,
  (0, auth_1.authorizeRoles)('admin', 'super admin'),
  quizSubmission_controller_1.getAllQuizSubmissionsController,
);
// Get a specific quiz submission by ID
quizSubmissionRouter.get(
  '/:submissionId',
  auth_1.isAuthenticated,
  quizSubmission_controller_1.getQuizSubmissionByIdController,
);
// Get all quiz submissions for a specific student
quizSubmissionRouter.get(
  '/student/:studentId',
  auth_1.isAuthenticated,
  quizSubmission_controller_1.getQuizSubmissionsByStudentController,
);
// Create a new quiz submission
quizSubmissionRouter.post(
  '/',
  auth_1.isAuthenticated,
  quizSubmission_controller_1.createQuizSubmissionController,
);
// Mark a quiz submission as graded with a score
quizSubmissionRouter.put(
  '/grade/:submissionId',
  auth_1.isAuthenticated,
  (0, auth_1.authorizeRoles)('admin', 'super admin'),
  quizSubmission_controller_1.markQuizSubmissionController,
);
// Delete a specific quiz submission
quizSubmissionRouter.delete(
  '/:submissionId',
  auth_1.isAuthenticated,
  (0, auth_1.authorizeRoles)('admin', 'super admin'),
  quizSubmission_controller_1.deleteQuizSubmissionController,
);
// Delete all quiz submissions (admin only)
quizSubmissionRouter.delete(
  '/all',
  auth_1.isAuthenticated,
  (0, auth_1.authorizeRoles)('admin', 'super admin'),
  quizSubmission_controller_1.deleteAllQuizSubmissionsController,
);
exports.default = quizSubmissionRouter;
