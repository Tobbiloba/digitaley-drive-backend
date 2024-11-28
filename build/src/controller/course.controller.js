'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== 'default' && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.getCoursesNameController =
  exports.searchCourse =
  exports.getAllCourses =
  exports.getCourseDetails =
  exports.getUserCourse =
  exports.getSubscribedCourse =
  exports.deleteCourseById =
  exports.updateCourse =
  exports.initializeCourse =
    void 0;
const course_model_1 = __importStar(require('../models/course.model'));
const user_model_1 = __importDefault(require('../models/user.model'));
const catchAsynchError_1 = __importDefault(
  require('../middleware/catchAsynchError'),
);
const ErrorHandler_1 = __importDefault(require('../utils/ErrorHandler'));
const category_model_1 = __importDefault(require('../models/category.model'));
const content_model_1 = require('../models/content.model');
const mongoose_1 = __importDefault(require('mongoose'));
const progress_model_1 = require('../models/progress.model');
exports.initializeCourse = (0, catchAsynchError_1.default)(
  async (req, res, next) => {
    try {
      const {
        name,
        description,
        thumbnail,
        courseInfo,
        visibility,
        availability,
      } = req.body;
      const categoryNames = courseInfo.categories; // Assuming courseInfo contains category names
      // Loop through category names and add the course ID to each category
      for (const categoryName of categoryNames) {
        const category = await category_model_1.default.findOne({
          name: categoryName.trim(),
        });
        if (!category) {
          return res
            .status(404)
            .json({ message: `Category '${categoryName}' not found` });
        }
      }
      const newCourse = new course_model_1.default({
        name,
        thumbnail,
        description,
        courseInfo,
        userCount: 0,
        availability,
        visibility,
      });
      const savedCourse = await newCourse.save();
      const courseId = savedCourse._id.toString();
      const content = await (0, content_model_1.createContent)();
      savedCourse.contentId = new mongoose_1.default.Types.ObjectId(
        content._id,
      );
      content.courseIdentifier = new mongoose_1.default.Types.ObjectId(
        courseId,
      );
      await content.save();
      for (const categoryName of categoryNames) {
        const category = await category_model_1.default.findOne({
          name: categoryName.trim(),
        });
        if (
          category &&
          !category.courses.includes(
            new mongoose_1.default.Types.ObjectId(courseId),
          )
        ) {
          category.courses.push(
            new mongoose_1.default.Types.ObjectId(courseId),
          );
          await category.save(); // Save the updated category document
        }
      }
      await savedCourse.save();
      res.status(201).json({
        success: true,
        data: courseId,
        message: 'Course initialized and linked to categories successfully',
      });
    } catch (error) {
      return next(new ErrorHandler_1.default(error.message, 500));
    }
  },
);
const updateCourse = async (req, res) => {
  try {
    console.log(req.body, req.params);
    const updatedCourse = await course_model_1.default.findByIdAndUpdate(
      req.params.courseId,
      req.body,
      { new: true },
    );
    if (!updatedCourse)
      return res.status(404).json({ message: 'Course not found' });
    res.status(200).json(updatedCourse);
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ message: 'Error updating course', error });
  }
};
exports.updateCourse = updateCourse;
const deleteCourseById = async (req, res) => {
  try {
    const course = await (0, course_model_1.getCourseByIdModel)(
      req.params.courseId,
    );
    if (!course) return res.status(404).json({ message: 'Course not found' });
    const deletedCourse = await (0, course_model_1.deleteCourseModel)(
      req.params.courseId,
    );
    if (!deletedCourse)
      return res.status(404).json({ message: 'Course not found' });
    res.status(200).json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ message: 'Error deleting course', error });
  }
};
exports.deleteCourseById = deleteCourseById;
// Other existing methods remain unchanged...
exports.getSubscribedCourse = (0, catchAsynchError_1.default)(
  async (req, res, next) => {
    try {
      const userId = req.params.userId || req.user._id; // Use userId from params or fallback to req.user._id
      const user = await user_model_1.default.findById(userId);
      if (!user) {
        return next(new ErrorHandler_1.default('User not found', 404));
      }
      console.log(user.role);
      // If the user is an admin, fetch all courses
      if (user.role === 'admin' || user.role === 'super admin') {
        const courses = await (0, course_model_1.getAllCoursesModel)();
        console.log(courses);
        return res.status(200).json({
          success: true,
          data: {
            courses: courses,
            progress: [],
          },
        });
      }
      // For regular users, check for subscribed courses
      if (!user.courses || user.courses.length === 0) {
        return res.status(200).json({
          success: true,
          message: 'No subscribed courses found',
          courses: [],
        });
      }
      // Fetch subscribed courses that are visible
      const subscribedCourses = await Promise.all(
        user.courses.map(async (course) => {
          console.log(course._id.toString());
          const courseDetails = await (0, course_model_1.getCourseByIdModel)(
            course.courseId.toString(),
          );
          return courseDetails && courseDetails.visibility
            ? courseDetails
            : null; // Only return visible courses
        }),
      );
      console.log(subscribedCourses);
      // Filter out null values (non-visible courses)
      const visibleCourses = subscribedCourses.filter(
        (course) => course !== null,
      );
      const progress = await (0, progress_model_1.getProgressByUserId)(userId);
      return res.status(200).json({
        success: true,
        data: {
          courses: visibleCourses,
          progress: progress,
        },
      });
    } catch (error) {
      console.error('Error fetching subscribed courses:', error);
      return next(
        new ErrorHandler_1.default(
          error.message || 'Internal Server Error',
          500,
        ),
      );
    }
  },
);
exports.getUserCourse = (0, catchAsynchError_1.default)(
  async (req, res, next) => {
    try {
      const { userId } = req.params;
      const user = await user_model_1.default.findById(userId);
      if (!user) {
        return next(new ErrorHandler_1.default('User not found', 404));
      }
      if (
        (!user.courses || user.courses.length === 0) &&
        user.role !== 'admin'
      ) {
        return res.status(200).json({
          success: true,
          message: 'No subscribed courses found',
          courses: [],
        });
      }
      if (user.role === 'admin') {
        const courses = await (0, course_model_1.getAllCoursesModel)();
        return res.status(200).json({
          success: true,
          courses,
        });
      } else {
        const subscribedCourses = await Promise.all(
          user.courses.map(async (course) => {
            return await (0, course_model_1.getCourseByIdModel)(course._id);
          }),
        );
        const progress = await (0, progress_model_1.getProgressByUserId)(
          userId,
        );
        return res.status(200).json({
          success: true,
          data: {
            courses: subscribedCourses,
            progress: progress,
          },
        });
      }
    } catch (error) {
      console.error('Error fetching subscribed courses:', error);
      return next(new ErrorHandler_1.default(error.message, 400));
    }
  },
);
// General Get Course Details
const getCourseDetails = async (req, res) => {
  try {
    const course = await (0, course_model_1.getCourseByIdModel)(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.status(200).json(course);
  } catch (error) {
    console.error('Error retrieving course:', error);
    res.status(500).json({ message: 'Error retrieving course', error });
  }
};
exports.getCourseDetails = getCourseDetails;
const getAllCourses = async (req, res) => {
  try {
    const { visible } = req.query; // Extract the 'visible' query parameter
    // Call the model with the appropriate filter
    const query =
      visible === 'false' ? { visibility: false } : { visibility: true };
    const courses = await (0, course_model_1.getAllCoursesModel)(query);
    res.status(200).json(courses);
  } catch (error) {
    console.error('Error retrieving courses:', error);
    res.status(500).json({ message: 'Error retrieving courses', error });
  }
};
exports.getAllCourses = getAllCourses;
// Search Courses
const searchCourse = async (req, res) => {
  const { query } = req.query;
  try {
    const courses = await (0, course_model_1.searchCourses)(query);
    res.status(200).json(courses);
  } catch (error) {
    console.error('Error searching courses:', error);
    res.status(500).json({ message: 'Error searching courses', error });
  }
};
exports.searchCourse = searchCourse;
const getCoursesNameController = async (req, res) => {
  try {
    const courses = await course_model_1.default.find({}, 'name'); // Fetch only the names
    // Extract names from the courses
    const courseNames = courses.map((course) => course.name);
    return res.status(200).json(courseNames); // Return just the names
  } catch (error) {
    console.error('Error searching courses:', error);
    res.status(500).json({ message: 'Error searching courses', error });
  }
};
exports.getCoursesNameController = getCoursesNameController;
