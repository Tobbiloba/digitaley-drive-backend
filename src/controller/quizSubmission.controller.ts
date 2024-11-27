import { Request, Response, NextFunction } from 'express';
import {
  getAllQuizSubmissionsModel,
  getQuizSubmissionByIdModel,
  getQuizSubmissionsByStudentId,
  createQuizSubmissionModel,
  markQuizSubmissionModel,
  deleteQuizSubmissionModel,
  deleteAllQuizSubmissionsModel,
} from '../models/quizSubmission.model';
import ErrorHandler from '../utils/ErrorHandler';
import { IQuizSubmission } from '../../@types/submission';
// Get all quiz submissions
export const getAllQuizSubmissionsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const submissions = await getAllQuizSubmissionsModel();
    res.status(200).json({ success: true, submissions });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 500));
  }
};

// Get a specific quiz submission by ID
export const getQuizSubmissionByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { submissionId } = req.params;
    const submission = await getQuizSubmissionByIdModel(submissionId);
    if (!submission) {
      return next(new ErrorHandler('Quiz submission not found', 404));
    }
    res.status(200).json({ success: true, submission });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 500));
  }
};

// Get all quiz submissions for a specific student
export const getQuizSubmissionsByStudentController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { studentId } = req.params;
    const { ObjectId } = require('mongodb');
    const submissions = await getQuizSubmissionsByStudentId(
      new ObjectId(studentId),
    );
    if (!submissions || submissions.length === 0) {
      return next(
        new ErrorHandler('No quiz submissions found for this student', 404),
      );
    }
    res.status(200).json({ success: true, submissions });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 500));
  }
};

// Create a new quiz submission
export const createQuizSubmissionController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { studentId, contentId, quizId, answers, score } = req.body;

    if (
      !studentId ||
      !contentId ||
      !quizId ||
      !answers ||
      answers.length === 0
    ) {
      return next(new ErrorHandler('Please provide all required fields', 400));
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
    const newSubmission = await createQuizSubmissionModel(
      submissionData as IQuizSubmission,
    );

    res.status(201).json({
      success: true,
      message: 'Quiz submission created successfully',
      newSubmission,
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 500));
  }
};

// Mark a quiz submission as graded with a score
export const markQuizSubmissionController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { submissionId } = req.params;
    const { score } = req.body;

    if (score == null) {
      return next(
        new ErrorHandler('Score is required to grade the submission', 400),
      );
    }

    const updatedSubmission = await markQuizSubmissionModel(
      submissionId,
      score,
    );
    if (!updatedSubmission) {
      return next(new ErrorHandler('Quiz submission not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Quiz submission graded successfully',
      updatedSubmission,
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 500));
  }
};

// Delete a specific quiz submission
export const deleteQuizSubmissionController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { submissionId } = req.params;
    const deletedSubmission = await deleteQuizSubmissionModel(submissionId);
    if (!deletedSubmission) {
      return next(new ErrorHandler('Quiz submission not found', 404));
    }
    res
      .status(200)
      .json({ success: true, message: 'Quiz submission deleted successfully' });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 500));
  }
};

// Delete all quiz submissions (used for admin purposes)
export const deleteAllQuizSubmissionsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await deleteAllQuizSubmissionsModel();
    res.status(200).json({
      success: true,
      message: 'All quiz submissions deleted successfully',
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 500));
  }
};
