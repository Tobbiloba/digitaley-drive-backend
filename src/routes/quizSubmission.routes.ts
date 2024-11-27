import express from 'express';
import {
  getAllQuizSubmissionsController,
  getQuizSubmissionByIdController,
  getQuizSubmissionsByStudentController,
  createQuizSubmissionController,
  markQuizSubmissionController,
  deleteQuizSubmissionController,
  deleteAllQuizSubmissionsController,
} from '../controller/quizSubmission.controller';
import { isAuthenticated, authorizeRoles } from '../middleware/auth';

const quizSubmissionRouter = express.Router();

// Get all quiz submissions
quizSubmissionRouter.get(
  '/all',
  isAuthenticated,
  authorizeRoles('admin', 'super admin'),
  getAllQuizSubmissionsController,
);

// Get a specific quiz submission by ID
quizSubmissionRouter.get(
  '/:submissionId',
  isAuthenticated,
  getQuizSubmissionByIdController,
);

// Get all quiz submissions for a specific student
quizSubmissionRouter.get(
  '/student/:studentId',
  isAuthenticated,
  getQuizSubmissionsByStudentController,
);

// Create a new quiz submission
quizSubmissionRouter.post('/', isAuthenticated, createQuizSubmissionController);

// Mark a quiz submission as graded with a score
quizSubmissionRouter.put(
  '/grade/:submissionId',
  isAuthenticated,
  authorizeRoles('admin', 'super admin'),
  markQuizSubmissionController,
);

// Delete a specific quiz submission
quizSubmissionRouter.delete(
  '/:submissionId',
  isAuthenticated,
  authorizeRoles('admin', 'super admin'),
  deleteQuizSubmissionController,
);

// Delete all quiz submissions (admin only)
quizSubmissionRouter.delete(
  '/all',
  isAuthenticated,
  authorizeRoles('admin', 'super admin'),
  deleteAllQuizSubmissionsController,
);

export default quizSubmissionRouter;
