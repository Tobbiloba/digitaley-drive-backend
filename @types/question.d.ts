import mongoose, { Document } from 'mongoose';

export interface ReplyQuestion {
  questionReply: string;
  date?: Date;
  userId: mongoose.Schema.Types.ObjectId;
}
export interface IReplyQuestion extends ReplyQuestion, Document {}
export interface IQuestion extends Document {
  question: string;
  contentId: mongoose.Schema.Types.ObjectId;
  date: Date;
  replyQuestions: IReplyQuestion[];
  userId: mongoose.Schema.Types.ObjectId;
  userName: string;
  thumbNail: string;
}
