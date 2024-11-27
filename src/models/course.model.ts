import mongoose, { Document, Schema } from 'mongoose';
import { ICourseInfo, ICourse } from '../../@types/course';

const CourseStatSchema: Schema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
  },
  modules: { type: Number, required: true },
  topics: { type: Number, required: true },
  weeks: { type: Number, required: true },
});
const PricingSchema: Schema = new Schema({
  withInternship: {
    priceUSD: { type: Number, required: false },
    priceNGN: { type: Number, required: false },
  },
  withoutInternship: {
    priceUSD: { type: Number, required: false },
    priceNGN: { type: Number, required: false },
  },
  weeklyPayment: {
    priceNGN: { type: Number, required: false },
  },
  monthlyPayment: {
    priceNGN: { type: Number, required: false },
  },
});

const CourseInfoSchema: Schema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
  },
  categories: [{ type: String, required: true }],
  stats: CourseStatSchema,
  brochureLink: { type: String, required: true },
  pricing: PricingSchema,
  withInternshipBenefit: { type: String, required: false },
  tools: [{ type: String, required: false }],
  skills: [{ type: String, required: false }],
  contentType: { type: String, required: true },
  withInternship: { type: Boolean, required: true },
});

// Define the main Course schema
const CourseSchema: Schema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
  },
  name: { type: String, required: true },
  description: { type: String, required: true },
  thumbnail: { type: String, required: true },
  courseInfo: CourseInfoSchema,
  contentId: { type: Schema.Types.ObjectId, ref: 'Content' },
  teacherId: { type: Schema.Types.ObjectId, ref: 'User' },
  userCount: { type: Number, required: true },
  date: Date,
  visibility: { type: Boolean, required: true },
  availability: { type: Boolean, required: true },
});

// Create the Course model
const Course = mongoose.model<ICourse>('course', CourseSchema);
export default Course;
// Model functions with fixes
export const getAllCoursesModel = async (query?: any) => {
  //   const query = onlyVisible ? { visibility: true } : {};
  return Course.find(query);
};
export const getCourseByIdModel = async (id: string) => {
  return Course.findById(id);
};

export const getCourseByNameModel = async (name: string) => {
  return Course.findOne({
    name,
  });
};

export const deleteCourseModel = (id: string) => Course.findByIdAndDelete(id);
export const searchCourses = async (queryParams: any) => {
  try {
    const searchQuery: any = {};

    // Text search on course name or description
    if (queryParams.q) {
      searchQuery.$text = { $search: queryParams.q };
    }

    // Filter by categories
    if (queryParams.categories) {
      searchQuery['courseInfo.categories'] = {
        $in: queryParams.categories.split(','),
      };
    }

    // Filter by contentType (if you have this field in your schema)
    if (queryParams.contentType) {
      searchQuery['courseData.module.weekDetail.content.videoPlayer'] =
        queryParams.contentType;
    }

    // Filter by price
    if (queryParams.minPrice && queryParams.maxPrice) {
      searchQuery['courseInfo.priceNGN'] = {
        $gte: parseFloat(queryParams.minPrice),
        $lte: parseFloat(queryParams.maxPrice),
      };
    } else if (queryParams.minPrice) {
      searchQuery['courseInfo.priceNGN'] = {
        $gte: parseFloat(queryParams.minPrice),
      };
    } else if (queryParams.maxPrice) {
      searchQuery['courseInfo.priceNGN'] = {
        $lte: parseFloat(queryParams.maxPrice),
      };
    }

    // Filter by visibility (assuming you have a field for visibility)
    if (queryParams.visibility) {
      searchQuery.visibility = queryParams.visibility;
    }

    // Perform the search
    const courses = await Course.find(searchQuery);
    return courses;
  } catch (error) {
    throw new Error('Error retrieving courses');
  }
};
