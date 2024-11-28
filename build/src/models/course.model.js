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
exports.searchCourses =
  exports.deleteCourseModel =
  exports.getCourseByNameModel =
  exports.getCourseByIdModel =
  exports.getAllCoursesModel =
    void 0;
const mongoose_1 = __importStar(require('mongoose'));
const CourseStatSchema = new mongoose_1.Schema({
  _id: {
    type: mongoose_1.Schema.Types.ObjectId,
    default: () => new mongoose_1.default.Types.ObjectId(),
  },
  modules: { type: Number, required: true },
  topics: { type: Number, required: true },
  weeks: { type: Number, required: true },
});
const PricingSchema = new mongoose_1.Schema({
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
const CourseInfoSchema = new mongoose_1.Schema({
  _id: {
    type: mongoose_1.Schema.Types.ObjectId,
    default: () => new mongoose_1.default.Types.ObjectId(),
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
const CourseSchema = new mongoose_1.Schema({
  _id: {
    type: mongoose_1.Schema.Types.ObjectId,
    default: () => new mongoose_1.default.Types.ObjectId(),
  },
  name: { type: String, required: true },
  description: { type: String, required: true },
  thumbnail: { type: String, required: true },
  courseInfo: CourseInfoSchema,
  contentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Content' },
  teacherId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
  userCount: { type: Number, required: true },
  date: Date,
  visibility: { type: Boolean, required: true },
  availability: { type: Boolean, required: true },
});
// Create the Course model
const Course = mongoose_1.default.model('course', CourseSchema);
exports.default = Course;
// Model functions with fixes
const getAllCoursesModel = async (query) => {
  //   const query = onlyVisible ? { visibility: true } : {};
  return Course.find(query);
};
exports.getAllCoursesModel = getAllCoursesModel;
const getCourseByIdModel = async (id) => {
  return Course.findById(id);
};
exports.getCourseByIdModel = getCourseByIdModel;
const getCourseByNameModel = async (name) => {
  return Course.findOne({
    name,
  });
};
exports.getCourseByNameModel = getCourseByNameModel;
const deleteCourseModel = (id) => Course.findByIdAndDelete(id);
exports.deleteCourseModel = deleteCourseModel;
const searchCourses = async (queryParams) => {
  try {
    const searchQuery = {};
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
exports.searchCourses = searchCourses;
