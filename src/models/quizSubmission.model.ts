import mongoose, { Document, Model, Schema, ObjectId } from 'mongoose';
import { IQuizSubmission } from '../../@types/submission';

const quizSubmissionSchema = new Schema<IQuizSubmission>({
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
  quizId: { type: mongoose.Schema.Types.ObjectId, required: true },
  answers: [
    {
      questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
      answer: { type: String, required: true },
      explanation: { type: String, required: false },
    },
  ],
  score: { type: Number, default: 0 },
  submittedAt: { type: Date, default: Date.now },
  graded: { type: Boolean, default: false },
});

export const quizSubmissionModel: Model<IQuizSubmission> = mongoose.model(
  'QuizSubmission',
  quizSubmissionSchema,
);

export const getAllQuizSubmissionsModel = async () => {
  return quizSubmissionModel.find();
};

export const getQuizSubmissionByIdModel = async (submissionId: string) => {
  return quizSubmissionModel.findById(submissionId);
};

export const getQuizSubmissionsByStudentId = async (studentId: ObjectId) => {
  return quizSubmissionModel.find({ studentId });
};

export const createQuizSubmissionModel = async (data: IQuizSubmission) => {
  return quizSubmissionModel.create(data);
};

export const markQuizSubmissionModel = async (
  submissionId: string,
  score: number,
) => {
  return quizSubmissionModel.findByIdAndUpdate(
    submissionId,
    { score, graded: true },
    { new: true },
  );
};

export const deleteQuizSubmissionModel = async (submissionId: string) => {
  return quizSubmissionModel.findByIdAndDelete(submissionId);
};

export const deleteAllQuizSubmissionsModel = async () => {
  return quizSubmissionModel.deleteMany();
};

export default quizSubmissionModel;
