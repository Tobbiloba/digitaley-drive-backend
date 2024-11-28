import { Router } from 'express';
import {
  initializeCourse,
  getCourseDetails,
  getAllCourses,
  deleteCourseById,
  updateCourse,
  getSubscribedCourse,
  getUserCourse,
} from '../controller/course.controller';
import { isAuthenticated, authorizeRoles } from '../middleware/auth';

const router = Router();

router.get('/my-course', isAuthenticated, getSubscribedCourse); // works
router.get('/user-course/:userId', isAuthenticated, getUserCourse);
router.post(
  '/initialize-course',
  isAuthenticated,
  authorizeRoles('admin', 'super admin', 'teacher'),
  initializeCourse,
);
router.get('/', getAllCourses);
router.get('/:id', getCourseDetails);
router.put(
  '/:courseId',
  isAuthenticated,
  authorizeRoles('admin', 'super admin', 'teacher'),
  updateCourse,
);
router.delete(
  '/:courseId',
  isAuthenticated,
  authorizeRoles('admin', 'super admin', 'teacher'),
  deleteCourseById,
);

export default router;
