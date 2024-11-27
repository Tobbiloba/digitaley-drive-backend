import { Request, Response, NextFunction } from 'express';
import {
  createContent,
  deletePartModel,
  updateContentInPartModel,
  getContentById,
  getAllContents,
  deleteContentById,
  getContentByCourseId,
  getContentPart,
  createPartModel,
  addContentToPartModel,
  addAssignmentQuestion,
  addQuizQuestion,
  deleteAssignmentQuestionById,
  updateAssignmentQuestionById,
  updateQuizQuestionById,
  deleteQuizQuestionById,
} from '../models/content.model';
import CatchAsyncError from '../middleware/catchAsynchError';
import ErrorHandler from '../utils/ErrorHandler';
import { getCourseByIdModel } from '../models/course.model';
import { IContentDetail } from '../../@types/content';

export const getAllContentController = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const contents = await getAllContents();
      res.status(200).json({
        success: true,
        data: contents,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

export const getContentByIdController = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { contentId } = req.params;
      console.log('contentId', contentId);
      const content = await getContentById(contentId);
      console.log('content', content);
      if (!content) {
        return next(new ErrorHandler('Content not found', 404));
      }
      res.status(200).json({
        success: true,
        data: content,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

export const getContentByCourseIdController = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId } = req.params;
      const content = await getContentByCourseId(courseId);
      if (!content) {
        return next(new ErrorHandler('Content not found for this course', 404));
      }
      res.status(200).json({
        success: true,
        data: content,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

export const createContentController = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId } = req.params;
      const course = await getCourseByIdModel(courseId);

      if (!course) {
        return next(new ErrorHandler('Course not found', 404));
      }

      const newContent = await createContent();
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
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

export const deleteContentByIdController = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { contentId } = req.params;
      const deletedContent = await deleteContentById(contentId);
      if (!deletedContent) {
        return next(new ErrorHandler('Content not found', 404));
      }
      res.status(204).send();
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

// Create part in content
export const createPartModelController = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { contentId } = req.params;
      const partData: IContentDetail = req.body;
      await createPartModel(contentId, partData);
      res.status(200).json({ message: 'Successfully created part  ' });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

// Add content to part
export const addContentToPartModelController = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { contentId, partId } = req.params;
      const newContent = req.body;
      const updatedContent = await addContentToPartModel(
        contentId,
        partId,
        newContent,
      );
      res.status(200).json(updatedContent);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

// Get specific content part
export const getContentPartController = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { contentId, partId } = req.params;
      const part = await getContentPart(contentId, partId);
      if (!part) {
        return next(new ErrorHandler('Part not found', 404));
      }
      res.status(200).json(part);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

// Delete part from content
export const deletePartModelController = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { contentId, partId } = req.params;
      await deletePartModel(contentId, partId);
      res.status(204).json({ message: 'Content deleted successfully' });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

// Update content in part
export const updateContentInPartModelController = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { contentId, partId } = req.params;
      const updatedContent = req.body;
      await updateContentInPartModel(contentId, partId, updatedContent);
      res.status(200).json({ message: 'Content updated successfully' });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

// Add assignment question
export const addAssignmentQuestionController = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { contentId } = req.params;
      const question = req.body;
      await addAssignmentQuestion(contentId, question);
      res.status(200).json({ message: 'Question added successfully' });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

// Add quiz question
export const addQuizQuestionController = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { contentId } = req.params;
      const question = req.body;

      console.log('question', question);
      await addQuizQuestion(contentId, question);
      res.status(200).json({ message: 'Question added successfully' });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

// Delete assignment question by ID

export const deleteAssignmentQuestionByIdController = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { contentId, partId, questionId } = req.params;
      await deleteAssignmentQuestionById(contentId, questionId);
      res.status(204).json({ message: 'Question deleted successfully' });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

// Update assignment question by ID
export const updateAssignmentQuestionByIdController = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { contentId, partId, questionId } = req.params;
      const updatedQuestion = req.body;
      await updateAssignmentQuestionById(
        contentId,
        questionId,
        updatedQuestion,
      );
      res.status(200).json({ message: 'Question updated successfully' });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

// Update quiz question by ID
export const updateQuizQuestionByIdController = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { contentId, questionId } = req.params;
      const updatedQuestion = req.body;

      console.log(contentId, questionId, updatedQuestion);
      await updateQuizQuestionById(contentId, questionId, updatedQuestion);
      res.status(200).json({ message: 'Question updated successfully' });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

// Delete quiz question by ID
export const deleteQuizQuestionByIdController = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { contentId, partId, questionId } = req.params;
      await deleteQuizQuestionById(contentId, questionId);
      res.status(204).json({ message: 'Question deleted successfully' });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);