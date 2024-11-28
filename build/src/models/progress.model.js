'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== 'default' && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.deleteAllProgress =
  exports.updateContentProgress =
  exports.resetProgress =
  exports.deleteProgress =
  exports.updateProgress =
  exports.createProgress =
  exports.getProgressByContentAndUserId =
  exports.getProgressByContentId =
  exports.getProgressByUserId =
  exports.getProgressBycontentId =
  exports.getProgressById =
  exports.getAllProgress =
    void 0;
const mongoose_1 = __importStar(require('mongoose'));
const ContentProgressSchema = new mongoose_1.Schema({
  subContentId: { type: mongoose_1.Schema.Types.ObjectId, required: true },
  viewed: { type: Boolean, required: true, default: false },
  dateViewed: { type: Date, required: false },
});
const ContentSchema = new mongoose_1.Schema(
  {
    contentId: {
      type: mongoose_1.Schema.Types.ObjectId,
      required: true,
    },
    userId: {
      type: mongoose_1.Schema.Types.ObjectId,
      required: true,
    },
    progress: {
      type: Number,
      required: true,
    },
    completed: {
      type: Boolean,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    contentProgress: [ContentProgressSchema],
  },
  { timestamps: true },
);
const ProgressModel = mongoose_1.default.model('Progress', ContentSchema);
const getAllProgress = async () => {
  return await ProgressModel.find().populate('contentId').populate('userId');
};
exports.getAllProgress = getAllProgress;
const getProgressById = async (id) => {
  return await ProgressModel.findById(id)
    .populate('contentId')
    .populate('userId');
};
exports.getProgressById = getProgressById;
const getProgressBycontentId = async (contentId) => {
  return await ProgressModel.find({ contentId })
    .populate('contentId')
    .populate('userId');
};
exports.getProgressBycontentId = getProgressBycontentId;
const getProgressByUserId = async (userId) => {
  return await ProgressModel.find({ userId })
    .populate('contentId')
    .populate('userId');
};
exports.getProgressByUserId = getProgressByUserId;
const getProgressByContentId = async (contentId) => {
  return await ProgressModel.find({ contentId })
    .populate('contentId')
    .populate('userId');
};
exports.getProgressByContentId = getProgressByContentId;
const getProgressByContentAndUserId = async (contentId, userId) => {
  return await ProgressModel.findOne({ contentId, userId })
    .populate('contentId')
    .populate('userId');
};
exports.getProgressByContentAndUserId = getProgressByContentAndUserId;
const createProgress = async (progress) => {
  return await ProgressModel.create(progress);
};
exports.createProgress = createProgress;
const updateProgress = async (id, progress) => {
  return await ProgressModel.findByIdAndUpdate(id, progress, { new: true });
};
exports.updateProgress = updateProgress;
const deleteProgress = async (id) => {
  return await ProgressModel.findByIdAndDelete(id);
};
exports.deleteProgress = deleteProgress;
const resetProgress = async (contentId, userId) => {
  return await ProgressModel.findOneAndUpdate(
    { contentId, userId },
    { progress: 0, completed: false, contentProgress: [] },
    { new: true },
  );
};
exports.resetProgress = resetProgress;
const updateContentProgress = async (
  contentId,
  userId,
  subContentId,
  viewed,
) => {
  return await ProgressModel.findOneAndUpdate(
    { contentId, userId, 'contentProgress.subContentId': subContentId },
    {
      $set: {
        'contentProgress.$.viewed': viewed,
        'contentProgress.$.dateViewed': Date.now(),
      },
    },
    { new: true },
  );
};
exports.updateContentProgress = updateContentProgress;
const deleteAllProgress = async () => {
  return await ProgressModel.deleteMany({});
};
exports.deleteAllProgress = deleteAllProgress;
exports.default = ProgressModel;
