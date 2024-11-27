import { Request, Response, NextFunction } from 'express';
import CatchAsyncError from '../middleware/catchAsynchError';
import ErrorHandler from '../utils/ErrorHandler';
// import {  } from '../models/assignmentSubmission.model';

import {
  getAllAssignmentSubmissionsModel,
  getAssignmentSubmissionByIdModel,
  createAssignmentSubmissionModel,
  markAssignmentSubmissionModel,
  updateAssignmentSubmissionModel,
  deleteAssignmentSubmissionModel,
  deleteAllAssignmentSubmissionsModel,
} from '../models/assignmentSubmission.model';

export const getAllSubmissionController = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const submission = await getAllAssignmentSubmissionsModel();
      res.status(200).json({
        success: true,
        data: submission,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

export const getAllSubmissionByIdController = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const submission = await getAssignmentSubmissionByIdModel(id);
      res.status(200).json({
        success: true,
        data: submission,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

export const createAssignmentController = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { data } = req.body;
      const submission = await createAssignmentSubmissionModel(data);
      res.status(200).json({
        success: true,
        data: submission,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

export const markAssignmentSubmissionController = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { submissionId } = req.params;
      const { score } = req.params;
      const submission = await markAssignmentSubmissionModel(
        submissionId,
        parseInt(score),
      );
      res.status(200).json({
        success: true,
        data: submission,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

export const updateAssignmentSubmissionController = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { submissionId } = req.params;
      const { data } = req.body;
      const submission = await updateAssignmentSubmissionModel(
        submissionId,
        data,
      );
      res.status(200).json({
        success: true,
        data: submission,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

export const deleteAssignmentSubmissionByIdController = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { submissionId } = req.params;
      const submission = await deleteAssignmentSubmissionModel(submissionId);
      res.status(200).json({
        success: true,
        data: submission,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

export const deleteAllAssignmentSubmissionController = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const submission = await deleteAllAssignmentSubmissionsModel();
      res.status(200).json({
        success: true,
        data: submission,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);
