import { Document, ObjectId } from 'mongoose';

export interface IQuizSubmission extends Document {
  studentId: ObjectId;
  contentId: ObjectId;
  quizId: ObjectId;
  answers: Array<{ questionId: ObjectId; answer: string; explanation: string }>;
  score: number;
  submittedAt?: any;
  graded: boolean;
}
interface Answer {
  type: 'pdf' | 'text';
  content: string;
}
export interface IAssignmentSubmission extends Document {
  studentId: ObjectId;
  contentId: ObjectId;
  assignmentId: ObjectId;
  answer: { questionId: ObjectId; answer: Answer };
  score: number;
  submittedAt?: any;
  graded: boolean;
}
