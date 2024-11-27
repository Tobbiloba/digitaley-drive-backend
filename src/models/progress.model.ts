import mongoose, { Document, Model, Schema } from 'mongoose';
import { IProgress } from '../../@types/progress';

const ContentProgressSchema: Schema = new Schema({
  subContentId: { type: Schema.Types.ObjectId, required: true },
  viewed: { type: Boolean, required: true, default: false },
  dateViewed: { type: Date, required: false },
});
const ContentSchema = new Schema<IProgress>(
  {
    contentId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
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

const ProgressModel: Model<IProgress> = mongoose.model(
  'Progress',
  ContentSchema,
);

export const getAllProgress = async () => {
  return await ProgressModel.find().populate('contentId').populate('userId');
};

export const getProgressById = async (id: string) => {
  return await ProgressModel.findById(id)
    .populate('contentId')
    .populate('userId');
};

export const getProgressBycontentId = async (contentId: string) => {
  return await ProgressModel.find({ contentId })
    .populate('contentId')
    .populate('userId');
};

export const getProgressByUserId = async (userId: string) => {
  return await ProgressModel.find({ userId })
    .populate('contentId')
    .populate('userId');
};
export const getProgressByContentId = async (contentId: string) => {
  return await ProgressModel.find({ contentId })
    .populate('contentId')
    .populate('userId');
};
export const getProgressByContentAndUserId = async (
  contentId: string,
  userId: string,
) => {
  return await ProgressModel.findOne({ contentId, userId })
    .populate('contentId')
    .populate('userId');
};

export const createProgress = async (progress: any) => {
  return await ProgressModel.create(progress);
};

export const updateProgress = async (id: string, progress: IProgress) => {
  return await ProgressModel.findByIdAndUpdate(id, progress, { new: true });
};

export const deleteProgress = async (id: string) => {
  return await ProgressModel.findByIdAndDelete(id);
};

export const resetProgress = async (contentId: string, userId: string) => {
  return await ProgressModel.findOneAndUpdate(
    { contentId, userId },
    { progress: 0, completed: false, contentProgress: [] },
    { new: true },
  );
};

export const updateContentProgress = async (
  contentId: string,
  userId: string,
  subContentId: string,
  viewed: boolean,
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
export const deleteAllProgress = async () => {
  return await ProgressModel.deleteMany({});
};
export default ProgressModel;
