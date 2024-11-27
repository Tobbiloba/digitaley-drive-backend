import express from 'express';
import {
  getAllSubmissionController,
  getAllSubmissionByIdController,
  createAssignmentController,
  markAssignmentSubmissionController,
  updateAssignmentSubmissionController,
  deleteAssignmentSubmissionByIdController,
  deleteAllAssignmentSubmissionController,
} from '../controller/assignmentSubmission';

const router = express.Router();

router.get('/assignments', getAllSubmissionController);
router.get('/assignments/:id', getAllSubmissionByIdController);
router.post('/assignments', createAssignmentController);
router.patch(
  '/assignments/:submissionId/mark/:score',
  markAssignmentSubmissionController,
);
router.put('/assignments/:submissionId', updateAssignmentSubmissionController);
router.delete(
  '/assignments/:submissionId',
  deleteAssignmentSubmissionByIdController,
);
router.delete('/assignments', deleteAllAssignmentSubmissionController);

export default router;
