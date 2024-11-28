import express from 'express';
import { isAuthenticated, authorizeRoles } from '../middleware/auth';
import {
  getAllProgressController,
  getProgressByUserIdController,
  getProgressByIdController,
  getProgressByContentAndUserIdController,
  deleteProgressController,
  resetProgressController,
  createProgressController,
  deleteAllProgressController,
  updateContentProgressController,
} from '../controller/progress.controller';

const router = express.Router();

router.get(
  '/',
  isAuthenticated,
  authorizeRoles('admin', 'super admin', 'teacher'),
  getAllProgressController,
);
router.post('/:contentId', isAuthenticated, createProgressController);
router.get('/user/:userId', isAuthenticated, getProgressByUserIdController);
router.get('/:progressId', isAuthenticated, getProgressByIdController);
router.get(
  '/:contentId/user/',
  isAuthenticated,
  getProgressByContentAndUserIdController,
);
router.post('/reset', isAuthenticated, resetProgressController);
router.delete('/delete-all', isAuthenticated, deleteAllProgressController);
router.delete('/:progressId', isAuthenticated, deleteProgressController);
router.put(
  '/:contentId/subContent/:subContentId',
  isAuthenticated,
  updateContentProgressController,
);

export default router;
