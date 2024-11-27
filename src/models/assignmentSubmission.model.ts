import mongoose, { Document, Model, Schema, ObjectId } from 'mongoose';
import { IAssignmentSubmission } from '../../@types/submission';

const assignmentSubmissionSchema = new Schema<IAssignmentSubmission>({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CourseContent',
    required: true,
  },
  assignmentId: { type: mongoose.Schema.Types.ObjectId, required: true },
  answer: { type: String, required: true },
  score: { type: Number, default: 0 },
  submittedAt: { type: Date, default: Date.now },
  graded: { type: Boolean, default: false },
});

export const assignmentSubmissionModel: Model<IAssignmentSubmission> =
  mongoose.model('AssignmentSubmission', assignmentSubmissionSchema);

export const getAllAssignmentSubmissionsModel = async () => {
  return assignmentSubmissionModel.find();
};

export const getAssignmentSubmissionByIdModel = async (
  submissionId: string,
) => {
  return assignmentSubmissionModel.findById(submissionId);
};

export const createAssignmentSubmissionModel = async (
  data: IAssignmentSubmission,
) => {
  return assignmentSubmissionModel.create(data);
};

export const markAssignmentSubmissionModel = async (
  submissionId: string,
  score: number,
) => {
  return assignmentSubmissionModel.findByIdAndUpdate(
    submissionId,
    { score, graded: true },
    { new: true },
  );
};

export const updateAssignmentSubmissionModel = async (
  submissionId: string,
  updatedData: Partial<IAssignmentSubmission>,
) => {
  return assignmentSubmissionModel.findByIdAndUpdate(
    submissionId,
    updatedData,
    { new: true },
  );
};

export const deleteAssignmentSubmissionModel = async (submissionId: string) => {
  return assignmentSubmissionModel.findByIdAndDelete(submissionId);
};

export const deleteAllAssignmentSubmissionsModel = async () => {
  return assignmentSubmissionModel.deleteMany();
};

export default assignmentSubmissionModel;
