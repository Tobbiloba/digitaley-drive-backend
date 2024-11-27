"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAllQuizSubmissionsController = exports.deleteQuizSubmissionController = exports.markQuizSubmissionController = exports.createQuizSubmissionController = exports.getQuizSubmissionsByStudentController = exports.getQuizSubmissionByIdController = exports.getAllQuizSubmissionsController = void 0;
const quizSubmission_model_1 = require("../models/quizSubmission.model");
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
// Get all quiz submissions
const getAllQuizSubmissionsController = async (req, res, next) => {
    try {
        const submissions = await (0, quizSubmission_model_1.getAllQuizSubmissionsModel)();
        res.status(200).json({ success: true, submissions });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
};
exports.getAllQuizSubmissionsController = getAllQuizSubmissionsController;
// Get a specific quiz submission by ID
const getQuizSubmissionByIdController = async (req, res, next) => {
    try {
        const { submissionId } = req.params;
        const submission = await (0, quizSubmission_model_1.getQuizSubmissionByIdModel)(submissionId);
        if (!submission) {
            return next(new ErrorHandler_1.default('Quiz submission not found', 404));
        }
        res.status(200).json({ success: true, submission });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
};
exports.getQuizSubmissionByIdController = getQuizSubmissionByIdController;
// Get all quiz submissions for a specific student
const getQuizSubmissionsByStudentController = async (req, res, next) => {
    try {
        const { studentId } = req.params;
        const { ObjectId } = require('mongodb');
        const submissions = await (0, quizSubmission_model_1.getQuizSubmissionsByStudentId)(new ObjectId(studentId));
        if (!submissions || submissions.length === 0) {
            return next(new ErrorHandler_1.default('No quiz submissions found for this student', 404));
        }
        res.status(200).json({ success: true, submissions });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
};
exports.getQuizSubmissionsByStudentController = getQuizSubmissionsByStudentController;
// Create a new quiz submission
const createQuizSubmissionController = async (req, res, next) => {
    try {
        const { studentId, contentId, quizId, answers, score } = req.body;
        if (!studentId ||
            !contentId ||
            !quizId ||
            !answers ||
            answers.length === 0) {
            return next(new ErrorHandler_1.default('Please provide all required fields', 400));
        }
        const submissionData = {
            studentId,
            contentId,
            quizId,
            answers,
            score,
            graded: true,
            submittedAt: Date.now(),
        };
        // @ts-ignore
        const newSubmission = await (0, quizSubmission_model_1.createQuizSubmissionModel)(submissionData);
        res.status(201).json({
            success: true,
            message: 'Quiz submission created successfully',
            newSubmission,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
};
exports.createQuizSubmissionController = createQuizSubmissionController;
// Mark a quiz submission as graded with a score
const markQuizSubmissionController = async (req, res, next) => {
    try {
        const { submissionId } = req.params;
        const { score } = req.body;
        if (score == null) {
            return next(new ErrorHandler_1.default('Score is required to grade the submission', 400));
        }
        const updatedSubmission = await (0, quizSubmission_model_1.markQuizSubmissionModel)(submissionId, score);
        if (!updatedSubmission) {
            return next(new ErrorHandler_1.default('Quiz submission not found', 404));
        }
        res.status(200).json({
            success: true,
            message: 'Quiz submission graded successfully',
            updatedSubmission,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
};
exports.markQuizSubmissionController = markQuizSubmissionController;
// Delete a specific quiz submission
const deleteQuizSubmissionController = async (req, res, next) => {
    try {
        const { submissionId } = req.params;
        const deletedSubmission = await (0, quizSubmission_model_1.deleteQuizSubmissionModel)(submissionId);
        if (!deletedSubmission) {
            return next(new ErrorHandler_1.default('Quiz submission not found', 404));
        }
        res
            .status(200)
            .json({ success: true, message: 'Quiz submission deleted successfully' });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
};
exports.deleteQuizSubmissionController = deleteQuizSubmissionController;
// Delete all quiz submissions (used for admin purposes)
const deleteAllQuizSubmissionsController = async (req, res, next) => {
    try {
        await (0, quizSubmission_model_1.deleteAllQuizSubmissionsModel)();
        res.status(200).json({
            success: true,
            message: 'All quiz submissions deleted successfully',
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
};
exports.deleteAllQuizSubmissionsController = deleteAllQuizSubmissionsController;
