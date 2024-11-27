import mongoose, { Document } from 'mongoose';

export interface IReview extends Document {
  review: string;
  rating: number;
  date: Date;
  contentId: mongoose.Schema.Types.ObjectId;
  userId: mongoose.Schema.Types.ObjectId;
}
