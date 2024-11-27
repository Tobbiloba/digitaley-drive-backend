"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllCategories = exports.addCategoryToCourse = exports.deleteCategory = exports.createCategory = void 0;
const course_model_1 = __importDefault(require("../models/course.model"));
const category_model_1 = __importDefault(require("../models/category.model"));
const catchAsynchError_1 = __importDefault(require("../middleware/catchAsynchError"));
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
exports.createCategory = (0, catchAsynchError_1.default)(async (req, res, next) => {
    try {
        const { name } = req.body;
        let category = await category_model_1.default.findOne({ name });
        if (category) {
            return next(new ErrorHandler_1.default('Category already exists', 400));
        }
        const newCategory = await category_model_1.default.create({ name, courses: [] });
        res.status(201).json({
            success: true,
            newCategory,
            message: 'Category created successfully',
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
exports.deleteCategory = (0, catchAsynchError_1.default)(async (req, res, next) => {
    try {
        const { categoryId } = req.params;
        const category = await category_model_1.default.findById(categoryId);
        if (!category) {
            return next(new ErrorHandler_1.default('Category not found', 404));
        }
        await course_model_1.default.updateMany({ categories: category.name }, { $unset: { categories: '' } });
        await category.deleteOne();
        res.status(200).json({
            success: true,
            message: 'Category deleted successfully and association removed from courses',
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
exports.addCategoryToCourse = (0, catchAsynchError_1.default)(async (req, res, next) => {
    try {
        const { courseId, categoryName } = req.body;
        let category = await category_model_1.default.findOne({ name: categoryName });
        if (!category) {
            return next(new ErrorHandler_1.default('Category not found', 404));
        }
        if (!category.courses.includes(courseId)) {
            category.courses.push(courseId);
            await category.save();
        }
        const course = await course_model_1.default.findByIdAndUpdate(courseId, { categories: category.name }, { new: true, runValidators: true });
        if (!course) {
            return next(new ErrorHandler_1.default('Course not found', 404));
        }
        res.status(200).json({
            success: true,
            category,
            course,
            message: 'Category added to course and course ID stored in category',
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
exports.getAllCategories = (0, catchAsynchError_1.default)(async (req, res, next) => {
    try {
        const categories = await category_model_1.default.find();
        res.status(200).json({
            success: true,
            categories,
            message: 'Categories retrieved successfully',
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
