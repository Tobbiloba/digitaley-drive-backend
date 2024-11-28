"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const course_controller_1 = require("../controller/course.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/my-course', auth_1.isAuthenticated, course_controller_1.getSubscribedCourse); // works
router.get('/user-course/:userId', auth_1.isAuthenticated, course_controller_1.getUserCourse);
router.post('/initialize-course', auth_1.isAuthenticated, (0, auth_1.authorizeRoles)('admin', 'super admin', 'teacher'), course_controller_1.initializeCourse);
router.get('/', course_controller_1.getAllCourses);
router.get('/:id', course_controller_1.getCourseDetails);
router.put('/:courseId', auth_1.isAuthenticated, (0, auth_1.authorizeRoles)('admin', 'super admin', 'teacher'), course_controller_1.updateCourse);
router.delete('/:courseId', auth_1.isAuthenticated, (0, auth_1.authorizeRoles)('admin', 'super admin', 'teacher'), course_controller_1.deleteCourseById);
exports.default = router;
