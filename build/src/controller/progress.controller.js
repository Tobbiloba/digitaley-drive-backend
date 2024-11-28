'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.deleteAllProgressController =
  exports.resetProgressController =
  exports.updateContentProgressController =
  exports.deleteProgressController =
  exports.updateProgressController =
  exports.createProgressController =
  exports.getProgressByContentAndUserIdController =
  exports.createProgressByUserIdAndContentIdController =
  exports.getProgressByUserIdController =
  exports.getProgressByContentIdController =
  exports.getProgressByIdController =
  exports.getAllProgressController =
    void 0;
const catchAsynchError_1 = __importDefault(
  require('../middleware/catchAsynchError'),
);
const ErrorHandler_1 = __importDefault(require('../utils/ErrorHandler'));
const progress_model_1 = require('../models/progress.model');
const content_model_1 = require('../models/content.model');
exports.getAllProgressController = (0, catchAsynchError_1.default)(
  async (req, res, next) => {
    try {
      const progress = await (0, progress_model_1.getAllProgress)();
      res.status(200).json({
        success: true,
        data: progress,
      });
    } catch (error) {
      return next(new ErrorHandler_1.default(error.message, 500));
    }
  },
);
exports.getProgressByIdController = (0, catchAsynchError_1.default)(
  async (req, res, next) => {
    try {
      const { progressId } = req.params;
      const progress = await (0, progress_model_1.getProgressById)(progressId);
      if (!progress) {
        return next(new ErrorHandler_1.default('Progress not found', 404));
      }
      res.status(200).json({
        success: true,
        data: progress,
      });
    } catch (error) {
      return next(new ErrorHandler_1.default(error.message, 500));
    }
  },
);
exports.getProgressByContentIdController = (0, catchAsynchError_1.default)(
  async (req, res, next) => {
    try {
      const { contentId } = req.params;
      const progress = await (0, progress_model_1.getProgressBycontentId)(
        contentId,
      );
      res.status(200).json({
        success: true,
        data: progress,
      });
    } catch (error) {
      return next(new ErrorHandler_1.default(error.message, 500));
    }
  },
);
exports.getProgressByUserIdController = (0, catchAsynchError_1.default)(
  async (req, res, next) => {
    try {
      const { userId } = req.params;
      const progress = await (0, progress_model_1.getProgressByUserId)(userId);
      res.status(200).json({
        success: true,
        data: progress,
      });
    } catch (error) {
      return next(new ErrorHandler_1.default(error.message, 500));
    }
  },
);
exports.createProgressByUserIdAndContentIdController = (0,
catchAsynchError_1.default)(async (req, res, next) => {
  try {
    const { userId, contentId } = req.body;
    const progress = await (0, progress_model_1.createProgress)({
      userId,
      contentId,
    });
    res.status(200).json({
      success: true,
      data: progress,
    });
  } catch (error) {
    return next(new ErrorHandler_1.default(error.message, 500));
  }
});
exports.getProgressByContentAndUserIdController = (0,
catchAsynchError_1.default)(async (req, res, next) => {
  try {
    const { contentId } = req.params;
    const userId = req.user._id;
    console.log(contentId, userId);
    const progress = await (0, progress_model_1.getProgressByContentAndUserId)(
      contentId,
      userId,
    );
    res.status(200).json({
      success: true,
      data: progress,
    });
  } catch (error) {
    return next(new ErrorHandler_1.default(error.message, 500));
  }
});
exports.createProgressController = (0, catchAsynchError_1.default)(
  async (req, res, next) => {
    try {
      const { contentId } = req.params;
      console.log(contentId);
      // Fetch content by contentId
      const content = await (0, content_model_1.getContentById)(contentId);
      // Check if content exists
      if (!content) {
        return res.status(404).json({
          success: false,
          message: 'Content not found',
        });
      }
      // Check if contentItems exist and map content IDs
      const contentItems = content.contentItems || [];
      const contentIds = contentItems.map((item) => item._id);
      // If no contentItems, return an error response
      if (contentIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No content items found in this content',
        });
      }
      // Create data structure for progress
      const data = {
        contentId: content._id,
        userId: req.user?._id, // Assuming req.user is set by your authentication middleware
        contentProgress: contentIds.map((id) => {
          return {
            subContentId: id,
            viewed: false,
          };
        }),
        progress: 0,
        completed: false,
      };
      // Call createProgress with the data
      const progress = await (0, progress_model_1.createProgress)(data); // Assuming createProgress takes the data object
      // Respond with created progress data
      return res.status(201).json({
        success: true,
        data: progress,
      });
    } catch (error) {
      return next(new ErrorHandler_1.default(error.message, 500));
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
exports.updateProgressController = (0, catchAsynchError_1.default)(
  async (req, res, next) => {
    try {
      const { progressId } = req.params;
      const progress = await (0, progress_model_1.updateProgress)(
        progressId,
        req.body,
      );
      res.status(200).json({
        success: true,
        data: progress,
      });
    } catch (error) {
      return next(new ErrorHandler_1.default(error.message, 500));
    }
  },
);
exports.deleteProgressController = (0, catchAsynchError_1.default)(
  async (req, res, next) => {
    try {
      const { progressId } = req.params;
      const progress = await (0, progress_model_1.deleteProgress)(progressId);
      res.status(200).json({
        success: true,
        data: progress,
      });
    } catch (error) {
      return next(new ErrorHandler_1.default(error.message, 500));
    }
  },
);
exports.updateContentProgressController = (0, catchAsynchError_1.default)(
  async (req, res, next) => {
    try {
      const { contentId, subContentId } = req.params;
      const { viewed } = req.body; // Boolean indicating whether the sub-content was viewed
      const userId = req.user._id;
      console.log({ contentId, userId, subContentId, viewed });
      // Update the progress (viewed status) for this sub-content
      const progress = await (0, progress_model_1.updateContentProgress)(
        contentId,
        userId,
        subContentId,
        viewed,
      );
      //   console.log({ progress });
      // Fetch the entire progress record for the content and user
      const entireProgress = await (0,
      progress_model_1.getProgressByContentAndUserId)(contentId, userId);
      // Handle case when progress is not found
      if (!entireProgress) {
        return res.status(404).json({
          success: false,
          message: 'Progress not found for the given content and user',
        });
      }
      // Update the progress in the contentProgress array
      const subContentIndex = entireProgress.contentProgress.findIndex(
        (item) => item.subContentId.toString() === subContentId,
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
        (item) => item.viewed === true,
      ).length;
      const newProgress = (viewedSubContent / totalSubContent) * 100;
      entireProgress.progress = newProgress;
      // Check if all sub-content is viewed, and mark content as completed
      const contentCompleted = entireProgress.contentProgress.every(
        (item) => item.viewed === true,
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
    } catch (error) {
      return next(new ErrorHandler_1.default(error.message, 500));
    }
  },
);
exports.resetProgressController = (0, catchAsynchError_1.default)(
  async (req, res, next) => {
    try {
      const { contentId } = req.params;
      const userId = req.user._id;
      const progress = await (0, progress_model_1.resetProgress)(
        contentId,
        userId,
      );
      res.status(200).json({
        success: true,
        data: progress,
      });
    } catch (error) {
      return next(new ErrorHandler_1.default(error.message, 500));
    }
  },
);
exports.deleteAllProgressController = (0, catchAsynchError_1.default)(
  async (req, res, next) => {
    try {
      const progress = await (0, progress_model_1.deleteAllProgress)();
      res.status(200).json({
        success: true,
        data: progress,
      });
    } catch (error) {
      return next(new ErrorHandler_1.default(error.message, 500));
    }
  },
);
