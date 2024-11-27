import { Request, Response, NextFunction } from 'express';
import CourseModel from '../models/course.model';
import CategoryModel from '../models/category.model';
import CatchAsyncError from '../middleware/catchAsynchError';
import ErrorHandler from '../utils/ErrorHandler';

export const createCategory = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name } = req.body;
      let category = await CategoryModel.findOne({ name });

      if (category) {
        return next(new ErrorHandler('Category already exists', 400));
      }

      const newCategory = await CategoryModel.create({ name, courses: [] });

      res.status(201).json({
        success: true,
        newCategory,
        message: 'Category created successfully',
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

export const deleteCategory = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { categoryId } = req.params;

      const category = await CategoryModel.findById(categoryId);
      if (!category) {
        return next(new ErrorHandler('Category not found', 404));
      }

      await CourseModel.updateMany(
        { categories: category.name },
        { $unset: { categories: '' } },
      );

      await category.deleteOne();
      res.status(200).json({
        success: true,
        message:
          'Category deleted successfully and association removed from courses',
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

export const addCategoryToCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId, categoryName } = req.body;

      let category = await CategoryModel.findOne({ name: categoryName });

      if (!category) {
        return next(new ErrorHandler('Category not found', 404));
      }

      if (!category.courses.includes(courseId)) {
        category.courses.push(courseId);
        await category.save();
      }

      const course = await CourseModel.findByIdAndUpdate(
        courseId,
        { categories: category.name },
        { new: true, runValidators: true },
      );

      if (!course) {
        return next(new ErrorHandler('Course not found', 404));
      }

      res.status(200).json({
        success: true,
        category,
        course,
        message: 'Category added to course and course ID stored in category',
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

export const getAllCategories = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const categories = await CategoryModel.find();
      res.status(200).json({
        success: true,
        categories,
        message: 'Categories retrieved successfully',
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);
