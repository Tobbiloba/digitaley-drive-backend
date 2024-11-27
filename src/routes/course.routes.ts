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
import { isAuthenticated } from '../middleware/auth';

const router = Router();

router.get('/my-course', isAuthenticated, getSubscribedCourse); // works
router.get('/user-course/:userId', isAuthenticated, getUserCourse);
router.post('/initialize-course', initializeCourse);
router.get('/', getAllCourses);
router.get('/:id', getCourseDetails);
router.put('/:courseId', updateCourse); // works
router.delete('/:courseId', deleteCourseById);

export default router;
