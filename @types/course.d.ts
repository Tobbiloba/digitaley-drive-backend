import { Types } from 'mongoose';

// Interface for CourseStat
export interface ICourseStat {
  _id?: Types.ObjectId;
  modules: number;
  topics: number;
  weeks: number;
}

// Interface for Pricing
export interface IPricing {
  withInternship?: {
    priceUSD?: number;
    priceNGN?: number;
  };
  withoutInternship?: {
    priceUSD?: number;
    priceNGN?: number;
  };
}

// Interface for CourseInfo
export interface ICourseInfo {
  _id?: Types.ObjectId;
  categories: string[];
  stats: CourseStat;
  brochureLink: string;
  pricing: Pricing;
  withInternshipBenefit: string;
  tools?: string[];
  contentType: string;
}

// Interface for Course
export interface ICourse {
  _id?: Types.ObjectId;
  name: string;
  description: string;
  thumbnail: string;
  courseInfo: CourseInfo;
  contentId?: Types.ObjectId; // Reference to Content
  teacherId?: Types.ObjectId; // Reference to User
  userCount: number;
  date?: Date;
  visibility: boolean;
  availability: boolean;
}
