"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteQuizQuestionByIdController = exports.updateQuizQuestionByIdController = exports.updateAssignmentQuestionByIdController = exports.deleteAssignmentQuestionByIdController = exports.addQuizQuestionController = exports.addAssignmentQuestionController = exports.updateContentInPartModelController = exports.deletePartModelController = exports.getContentPartController = exports.addContentToPartModelController = exports.createPartModelController = exports.deleteContentByIdController = exports.createContentController = exports.getContentByCourseIdController = exports.getContentByIdController = exports.getAllContentController = void 0;
const content_model_1 = require("../models/content.model");
const catchAsynchError_1 = __importDefault(require("../middleware/catchAsynchError"));
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const course_model_1 = require("../models/course.model");
exports.getAllContentController = (0, catchAsynchError_1.default)(async (req, res, next) => {
    try {
        const contents = await (0, content_model_1.getAllContents)();
        res.status(200).json({
            success: true,
            data: contents,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
exports.getContentByIdController = (0, catchAsynchError_1.default)(async (req, res, next) => {
    try {
        const { contentId } = req.params;
        console.log('contentId', contentId);
        const content = await (0, content_model_1.getContentById)(contentId);
        console.log('content', content);
        if (!content) {
            return next(new ErrorHandler_1.default('Content not found', 404));
        }
        res.status(200).json({
            success: true,
            data: content,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
exports.getContentByCourseIdController = (0, catchAsynchError_1.default)(async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const content = await (0, content_model_1.getContentByCourseId)(courseId);
        if (!content) {
            return next(new ErrorHandler_1.default('Content not found for this course', 404));
        }
        res.status(200).json({
            success: true,
            data: content,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
exports.createContentController = (0, catchAsynchError_1.default)(async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const course = await (0, course_model_1.getCourseByIdModel)(courseId);
        if (!course) {
            return next(new ErrorHandler_1.default('Course not found', 404));
        }
        const newContent = await (0, content_model_1.createContent)();
        // @ts-ignore
        course.contentId = newContent._id; // Update course with content ID
        // @ts-ignore
        newContent.courseId = course._id; // Set course ID on new content
        // @ts-ignore
        newContent.visibility = true; // Correct spelling
        await course.save();
        // @ts-ignore
        await newContent.save();
        res
            .status(201)
            .json({ message: 'Content created successfully', data: newContent });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
exports.deleteContentByIdController = (0, catchAsynchError_1.default)(async (req, res, next) => {
    try {
        const { contentId } = req.params;
        const deletedContent = await (0, content_model_1.deleteContentById)(contentId);
        if (!deletedContent) {
            return next(new ErrorHandler_1.default('Content not found', 404));
        }
        res.status(204).send();
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
// Create part in content
exports.createPartModelController = (0, catchAsynchError_1.default)(async (req, res, next) => {
    try {
        const { contentId } = req.params;
        const partData = req.body;
        await (0, content_model_1.createPartModel)(contentId, partData);
        res.status(200).json({ message: 'Successfully created part  ' });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
// Add content to part
exports.addContentToPartModelController = (0, catchAsynchError_1.default)(async (req, res, next) => {
    try {
        const { contentId, partId } = req.params;
        const newContent = req.body;
        const updatedContent = await (0, content_model_1.addContentToPartModel)(contentId, partId, newContent);
        res.status(200).json(updatedContent);
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
// Get specific content part
exports.getContentPartController = (0, catchAsynchError_1.default)(async (req, res, next) => {
    try {
        const { contentId, partId } = req.params;
        const part = await (0, content_model_1.getContentPart)(contentId, partId);
        if (!part) {
            return next(new ErrorHandler_1.default('Part not found', 404));
        }
        res.status(200).json(part);
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
// Delete part from content
exports.deletePartModelController = (0, catchAsynchError_1.default)(async (req, res, next) => {
    try {
        const { contentId, partId } = req.params;
        await (0, content_model_1.deletePartModel)(contentId, partId);
        res.status(204).json({ message: 'Content deleted successfully' });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
// Update content in part
exports.updateContentInPartModelController = (0, catchAsynchError_1.default)(async (req, res, next) => {
    try {
        const { contentId, partId } = req.params;
        const updatedContent = req.body;
        await (0, content_model_1.updateContentInPartModel)(contentId, partId, updatedContent);
        res.status(200).json({ message: 'Content updated successfully' });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
// Add assignment question
exports.addAssignmentQuestionController = (0, catchAsynchError_1.default)(async (req, res, next) => {
    try {
        const { contentId } = req.params;
        const question = req.body;
        await (0, content_model_1.addAssignmentQuestion)(contentId, question);
        res.status(200).json({ message: 'Question added successfully' });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
// Add quiz question
exports.addQuizQuestionController = (0, catchAsynchError_1.default)(async (req, res, next) => {
    try {
        const { contentId } = req.params;
        const question = req.body;
        console.log('question', question);
        await (0, content_model_1.addQuizQuestion)(contentId, question);
        res.status(200).json({ message: 'Question added successfully' });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
// Delete assignment question by ID
exports.deleteAssignmentQuestionByIdController = (0, catchAsynchError_1.default)(async (req, res, next) => {
    try {
        const { contentId, partId, questionId } = req.params;
        await (0, content_model_1.deleteAssignmentQuestionById)(contentId, questionId);
        res.status(204).json({ message: 'Question deleted successfully' });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
// Update assignment question by ID
exports.updateAssignmentQuestionByIdController = (0, catchAsynchError_1.default)(async (req, res, next) => {
    try {
        const { contentId, partId, questionId } = req.params;
        const updatedQuestion = req.body;
        await (0, content_model_1.updateAssignmentQuestionById)(contentId, questionId, updatedQuestion);
        res.status(200).json({ message: 'Question updated successfully' });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
// Update quiz question by ID
exports.updateQuizQuestionByIdController = (0, catchAsynchError_1.default)(async (req, res, next) => {
    try {
        const { contentId, questionId } = req.params;
        const updatedQuestion = req.body;
        console.log(contentId, questionId, updatedQuestion);
        await (0, content_model_1.updateQuizQuestionById)(contentId, questionId, updatedQuestion);
        res.status(200).json({ message: 'Question updated successfully' });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
// Delete quiz question by ID
exports.deleteQuizQuestionByIdController = (0, catchAsynchError_1.default)(async (req, res, next) => {
    try {
        const { contentId, partId, questionId } = req.params;
        await (0, content_model_1.deleteQuizQuestionById)(contentId, questionId);
        res.status(204).json({ message: 'Question deleted successfully' });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
