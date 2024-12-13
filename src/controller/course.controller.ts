import { Request, Response, NextFunction } from 'express';
import Course, {
  getAllCoursesModel,
  getCourseByIdModel,
  deleteCourseModel,
  searchCourses,
} from '../models/course.model';
import userModel from '../models/user.model';
import CatchAsyncError from '../middleware/catchAsynchError';
import ErrorHandler from '../utils/ErrorHandler';
import CategoryModel from '../models/category.model';
import { createContent } from '../models/content.model';
import mongoose from 'mongoose';
import { getProgressByUserId } from '../models/progress.model';
export const initializeCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
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
        const category = await CategoryModel.findOne({
          name: categoryName.trim(),
        });

        if (!category) {
          return res
            .status(404)
            .json({ message: `Category '${categoryName}' not found` });
        }
      }

      const newCourse = new Course({
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

      const content = await createContent();
      savedCourse.contentId = new mongoose.Types.ObjectId(
        content._id as string,
      );

      content.courseIdentifier = new mongoose.Types.ObjectId(courseId);
      await content.save();

      for (const categoryName of categoryNames) {
        const category = await CategoryModel.findOne({
          name: categoryName.trim(),
        });

        if (
          category &&
          !category.courses.includes(
            new mongoose.Types.ObjectId(courseId as string),
          )
        ) {
          category.courses.push(
            new mongoose.Types.ObjectId(courseId as string),
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
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

export const updateCourse = async (req: Request, res: Response) => {
  try {
    console.log(req.body, req.params);
    const updatedCourse = await Course.findByIdAndUpdate(
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

export const deleteCourseById = async (req: Request, res: Response) => {
  try {
    const course = await getCourseByIdModel(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const deletedCourse = await deleteCourseModel(req.params.courseId);
    if (!deletedCourse)
      return res.status(404).json({ message: 'Course not found' });

    res.status(200).json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ message: 'Error deleting course', error });
  }
};

// Other existing methods remain unchanged...

export const getSubscribedCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.userId || req.user._id; // Use userId from params or fallback to req.user._id
      const user = await userModel.findById(userId);

      if (!user) {
        return next(new ErrorHandler('User not found', 404));
      }
      const progress = await getProgressByUserId(userId);
      console.log(user.role);
      // If the user is an admin, fetch all courses
      if (user.role === 'admin' || user.role === 'super admin') {
        const courses = await getAllCoursesModel();
        console.log({courses, progress});
        return res.status(200).json({
          success: true,
          courses: courses,
            progress: progress,
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
        user.courses.map(async (course: any) => {
          console.log(course._id.toString());
          const courseDetails = await getCourseByIdModel(
            course.courseId.toString(),
          );
          return courseDetails && courseDetails.visibility
            ? courseDetails
            : null; // Only return visible courses
        }),
      );

    //   console.log(subscribedCourses);

      // Filter out null values (non-visible courses)
      const visibleCourses = subscribedCourses.filter(
        (course) => course !== null,
      );
      console.log({userId})

      return res.status(200).json({
        success: true,
        // data: {
          courses: visibleCourses,
          progress: progress,
        // },
      });
    } catch (error: any) {
      console.error('Error fetching subscribed courses:', error);
      return next(
        new ErrorHandler(error.message || 'Internal Server Error', 500),
      );
    }
  },
);

export const getUserCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;

      const user = await userModel.findById(userId);
      if (!user) {
        return next(new ErrorHandler('User not found', 404));
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
        const courses = await getAllCoursesModel();
        return res.status(200).json({
          success: true,
          courses,
        });
      } else {
        const subscribedCourses = await Promise.all(
          user.courses.map(async (course: any) => {
            return await getCourseByIdModel(course._id);
          }),
        );
        const progress = await getProgressByUserId(userId);

        return res.status(200).json({
          success: true,
          data: {
            courses: subscribedCourses,
            progress: progress,
          },
        });
      }
    } catch (error: any) {
      console.error('Error fetching subscribed courses:', error);
      return next(new ErrorHandler(error.message, 400));
    }
  },
);

// General Get Course Details
export const getCourseDetails = async (req: Request, res: Response) => {
  try {
    const course = await getCourseByIdModel(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.status(200).json(course);
  } catch (error) {
    console.error('Error retrieving course:', error);
    res.status(500).json({ message: 'Error retrieving course', error });
  }
};

export const getAllCourses = async (req: Request, res: Response) => {
  try {
    const { visible } = req.query; // Extract the 'visible' query parameter
    // Call the model with the appropriate filter
    const query =
      visible === 'false' ? { visibility: false } : { visibility: true };
    const courses = await getAllCoursesModel(query);
    res.status(200).json(courses);
  } catch (error) {
    console.error('Error retrieving courses:', error);
    res.status(500).json({ message: 'Error retrieving courses', error });
  }
};

// Search Courses
export const searchCourse = async (req: Request, res: Response) => {
  const { query } = req.query;
  try {
    const courses = await searchCourses(query);
    res.status(200).json(courses);
  } catch (error) {
    console.error('Error searching courses:', error);
    res.status(500).json({ message: 'Error searching courses', error });
  }
};

export const getCoursesNameController = async (req: Request, res: Response) => {
  try {
    const courses = await Course.find({}, 'name'); // Fetch only the names

    // Extract names from the courses
    const courseNames = courses.map((course) => course.name);
    return res.status(200).json(courseNames); // Return just the names
  } catch (error) {
    console.error('Error searching courses:', error);
    res.status(500).json({ message: 'Error searching courses', error });
  }
};
