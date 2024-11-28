'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.deleteAllAssignmentSubmissionController =
  exports.deleteAssignmentSubmissionByIdController =
  exports.updateAssignmentSubmissionController =
  exports.markAssignmentSubmissionController =
  exports.createAssignmentController =
  exports.getAllSubmissionByIdController =
  exports.getAllSubmissionController =
    void 0;
const catchAsynchError_1 = __importDefault(
  require('../middleware/catchAsynchError'),
);
const ErrorHandler_1 = __importDefault(require('../utils/ErrorHandler'));
// import {  } from '../models/assignmentSubmission.model';
const assignmentSubmission_model_1 = require('../models/assignmentSubmission.model');
exports.getAllSubmissionController = (0, catchAsynchError_1.default)(
  async (req, res, next) => {
    try {
      const submission = await (0,
      assignmentSubmission_model_1.getAllAssignmentSubmissionsModel)();
      res.status(200).json({
        success: true,
        data: submission,
      });
    } catch (error) {
      return next(new ErrorHandler_1.default(error.message, 500));
    }
  },
);
exports.getAllSubmissionByIdController = (0, catchAsynchError_1.default)(
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const submission = await (0,
      assignmentSubmission_model_1.getAssignmentSubmissionByIdModel)(id);
      res.status(200).json({
        success: true,
        data: submission,
      });
    } catch (error) {
      return next(new ErrorHandler_1.default(error.message, 500));
    }
  },
);
exports.createAssignmentController = (0, catchAsynchError_1.default)(
  async (req, res, next) => {
    try {
      const { data } = req.body;
      const submission = await (0,
      assignmentSubmission_model_1.createAssignmentSubmissionModel)(data);
      res.status(200).json({
        success: true,
        data: submission,
      });
    } catch (error) {
      return next(new ErrorHandler_1.default(error.message, 500));
    }
  },
);
exports.markAssignmentSubmissionController = (0, catchAsynchError_1.default)(
  async (req, res, next) => {
    try {
      const { submissionId } = req.params;
      const { score } = req.params;
      const submission = await (0,
      assignmentSubmission_model_1.markAssignmentSubmissionModel)(
        submissionId,
        parseInt(score),
      );
      res.status(200).json({
        success: true,
        data: submission,
      });
    } catch (error) {
      return next(new ErrorHandler_1.default(error.message, 500));
    }
  },
);
exports.updateAssignmentSubmissionController = (0, catchAsynchError_1.default)(
  async (req, res, next) => {
    try {
      const { submissionId } = req.params;
      const { data } = req.body;
      const submission = await (0,
      assignmentSubmission_model_1.updateAssignmentSubmissionModel)(
        submissionId,
        data,
      );
      res.status(200).json({
        success: true,
        data: submission,
      });
    } catch (error) {
      return next(new ErrorHandler_1.default(error.message, 500));
    }
  },
);
exports.deleteAssignmentSubmissionByIdController = (0,
catchAsynchError_1.default)(async (req, res, next) => {
  try {
    const { submissionId } = req.params;
    const submission = await (0,
    assignmentSubmission_model_1.deleteAssignmentSubmissionModel)(submissionId);
    res.status(200).json({
      success: true,
      data: submission,
    });
  } catch (error) {
    return next(new ErrorHandler_1.default(error.message, 500));
  }
});
exports.deleteAllAssignmentSubmissionController = (0,
catchAsynchError_1.default)(async (req, res, next) => {
  try {
    const submission = await (0,
    assignmentSubmission_model_1.deleteAllAssignmentSubmissionsModel)();
    res.status(200).json({
      success: true,
      data: submission,
    });
  } catch (error) {
    return next(new ErrorHandler_1.default(error.message, 500));
  }
});
