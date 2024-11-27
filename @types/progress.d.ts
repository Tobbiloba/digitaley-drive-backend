import { Types } from 'mongoose';

export interface IContentProgress {
  subContentId: Types.ObjectId;
  viewed: Boolean;
  dateViewed: Date;
}

export interface IProgress {
  contentId: Types.ObjectId;
  userId: Types.ObjectId;
  progress: number;
  completed: boolean;
  date: Date;
  contentProgress: IContentProgress[];
}
