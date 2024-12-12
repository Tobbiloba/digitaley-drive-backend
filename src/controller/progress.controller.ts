import { Request, Response, NextFunction } from 'express';
import CatchAsyncError from '../middleware/catchAsynchError';
import ErrorHandler from '../utils/ErrorHandler';
import {
  getAllProgress,
  getProgressByUserId,
  getProgressByContentAndUserId,
  getProgressBycontentId,
  getProgressById,
  deleteProgress,
  updateProgress,
  updateContentProgress,
  createProgress,
  resetProgress,
  deleteAllProgress,
  getProgressByContentId,
} from '../models/progress.model';
import { getContentById } from '../models/content.model';

export const getAllProgressController = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const progress = await getAllProgress();
      res.status(200).json({
        success: true,
        data: progress,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

export const getProgressByIdController = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { progressId } = req.params;
      const progress = await getProgressById(progressId);
      if (!progress) {
        return next(new ErrorHandler('Progress not found', 404));
      }
      res.status(200).json({
        success: true,
        data: progress,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

export const getProgressByContentIdController = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { contentId } = req.params;
      const progress = await getProgressBycontentId(contentId);
      res.status(200).json({
        success: true,
        data: progress,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

export const getProgressByUserIdController = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const progress = await getProgressByUserId(userId);
      res.status(200).json({
        success: true,
        data: progress,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

export const createProgressByUserIdAndContentIdController = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, contentId } = req.body;
      const progress = await createProgress({ userId, contentId });
      res.status(200).json({
        success: true,
        data: progress,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

export const getProgressByContentAndUserIdController = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { contentId } = req.params;
      const userId = req.user._id;

      console.log(contentId, userId);
      const progress = await getProgressByContentAndUserId(contentId, userId);
      res.status(200).json({
        success: true,
        data: progress,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

export const createProgressController = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { contentId } = req.params;
      console.log({contentId});

      // Fetch content by contentId
      const content = await getContentById(contentId);
        console.log(content)
      // Check if content exists
      if (!content) {
        return res.status(404).json({
          success: false,
          message: 'Content not found',
        });
      }

      // Check if contentItems exist and map content IDs
      const contentItems = content.contentItems || [];
      const contentIds = contentItems.map((item: any) => item._id);

      // If no contentItems, return an error response
    //   if (contentIds.length === 0) {
    //     return res.status(400).json({
    //       success: false,
    //       message: 'No content items found in this content',
    //     });
    //   }

      // Create data structure for progress
      const data = {
        contentId: content._id,
        userId: req.user?._id, // Assuming req.user is set by your authentication middleware
        contentProgress: contentIds.map((id: any) => {
          return {
            subContentId: id,
            viewed: false,
          };
        }),
        progress: 0,
        completed: false,
      };

      // Call createProgress with the data
      const progress = await createProgress(data); // Assuming createProgress takes the data object

      // Respond with created progress data
      return res.status(201).json({
        success: true,
        data: progress,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

// export const createProgressFunction = async (contentId: any, userId:any) => {
//     const content = await getContentById(contentId);
//     const contents = content?.contentItems;

//     const progress = await createProgress({
//         courseId: content.courseId,
//         userId,
//         contentProgress: [
//             {
//                 contentId,
//                 viewed: false
//             }
//         ]
//     });
// }

export const updateProgressController = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { progressId } = req.params;
      const progress = await updateProgress(progressId, req.body);
      res.status(200).json({
        success: true,
        data: progress,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

export const deleteProgressController = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { progressId } = req.params;
      const progress = await deleteProgress(progressId);
      res.status(200).json({
        success: true,
        data: progress,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

export const updateContentProgressController = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { contentId, subContentId } = req.params;
      const { viewed } = req.body; // Boolean indicating whether the sub-content was viewed
      const userId = req.user._id;

      console.log({ contentId, userId, subContentId, viewed });

      // Update the progress (viewed status) for this sub-content
      const progress = await updateContentProgress(
        contentId,
        userId,
        subContentId,
        viewed,
      );
      //   console.log({ progress });

      // Fetch the entire progress record for the content and user
      const entireProgress = await getProgressByContentAndUserId(
        contentId,
        userId,
      );

      // Handle case when progress is not found
      if (!entireProgress) {
        return res.status(404).json({
          success: false,
          message: 'Progress not found for the given content and user',
        });
      }

      // Update the progress in the contentProgress array
      const subContentIndex = entireProgress.contentProgress.findIndex(
        (item: any) => item.subContentId.toString() === subContentId,
      );

      if (subContentIndex !== -1) {
        // Update the viewed status and the date when the content was viewed
        entireProgress.contentProgress[subContentIndex].viewed = viewed;
        if (viewed) {
          entireProgress.contentProgress[subContentIndex].dateViewed =
            new Date();
        }
      }

      // Recalculate the progress percentage
      const totalSubContent = entireProgress.contentProgress.length;
      const viewedSubContent = entireProgress.contentProgress.filter(
        (item: any) => item.viewed === true,
      ).length;

      const newProgress = (viewedSubContent / totalSubContent) * 100;
      entireProgress.progress = newProgress;

      // Check if all sub-content is viewed, and mark content as completed
      const contentCompleted = entireProgress.contentProgress.every(
        (item: any) => item.viewed === true,
      );

      // Update the completed status
      entireProgress.completed = contentCompleted;
      await entireProgress.save();

      //   console.log({ entireProgress });

      // Send the response with updated progress
      res.status(200).json({
        success: true,
        data: entireProgress, // Or just send the progress if needed
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

export const resetProgressController = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { contentId } = req.params;
      const userId = req.user._id;
      const progress = await resetProgress(contentId, userId);
      res.status(200).json({
        success: true,
        data: progress,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);
export const deleteAllProgressController = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const progress = await deleteAllProgress();
      res.status(200).json({
        success: true,
        data: progress,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);
