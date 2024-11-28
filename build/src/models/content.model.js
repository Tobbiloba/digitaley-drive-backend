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
exports.deleteAssignmentQuestionById =
  exports.updateAssignmentQuestionById =
  exports.addAssignmentQuestion =
  exports.deleteQuizQuestionById =
  exports.updateQuizQuestionById =
  exports.addQuizQuestion =
  exports.updateContentInPartModel =
  exports.deletePartModel =
  exports.getContentPart =
  exports.addContentToPartModel =
  exports.createPartModel =
  exports.deleteContentById =
  exports.createContent =
  exports.getContentByCourseId =
  exports.getContentById =
  exports.getAllContents =
    void 0;
const mongoose_1 = __importStar(require('mongoose'));
// Define the schema for hyperlinks
const HyperlinkSchema = new mongoose_1.Schema({
  linkTitle: { type: String, required: false },
  linkUrl: { type: String, required: false },
});
// Define the schema for content details
const ContentDetailSchema = new mongoose_1.Schema({
  _id: {
    type: mongoose_1.Schema.Types.ObjectId,
    default: () => new mongoose_1.default.Types.ObjectId(),
  },
  heading: { type: String, required: true },
  summary: { type: String, required: true },
  media: {
    mediaUrl: { type: String },
    mediaType: { type: String, required: true },
  },
  relatedLinks: [HyperlinkSchema],
});
// Define the schema for course sections
const ContentItemSchema = new mongoose_1.Schema({
  _id: {
    type: mongoose_1.Schema.Types.ObjectId,
    default: () => new mongoose_1.default.Types.ObjectId(),
  },
  sectionNumber: { type: Number, required: true },
  contentDetails: { type: ContentDetailSchema, required: true },
});
// Define the schema for assignment questions
const AssignmentQuestionsSchema = new mongoose_1.Schema({
  question: { type: String, required: true },
});
// Define the schema for quiz questions
const QuestionSchema = new mongoose_1.Schema({
  question: { type: String, required: true },
  options: { type: [String], required: false },
  answer: { type: String, required: true },
});
// Define the main course content schema
const CourseContentSchema = new mongoose_1.Schema({
  _id: {
    type: mongoose_1.Schema.Types.ObjectId,
    default: () => new mongoose_1.default.Types.ObjectId(),
  },
  contentItems: { type: [ContentItemSchema], default: [] },
  likeCount: { type: Number, default: 0 },
  dislikeCount: { type: Number, default: 0 },
  courseIdentifier: {
    type: mongoose_1.Schema.Types.ObjectId,
    ref: 'Course',
    required: false,
  },
  visibility: { type: Boolean, default: false },
  date: { type: Date, default: Date.now },
  assignment: { type: [AssignmentQuestionsSchema], default: [] },
  quiz: { type: [QuestionSchema], default: [] },
});
// Create the CourseContent model
const CourseContent = mongoose_1.default.model(
  'CourseContent',
  CourseContentSchema,
);
exports.default = CourseContent;
// Model functions
const getAllContents = async () => {
  return await CourseContent.find();
};
exports.getAllContents = getAllContents;
const getContentById = async (contentId) => {
  return await CourseContent.findById(contentId);
};
exports.getContentById = getContentById;
const getContentByCourseId = async (courseId) => {
  return await CourseContent.findOne({ courseIdentifier: courseId });
};
exports.getContentByCourseId = getContentByCourseId;
const createContent = async () => {
  return await CourseContent.create({});
};
exports.createContent = createContent;
const deleteContentById = async (contentId) => {
  return await CourseContent.findByIdAndDelete(contentId);
};
exports.deleteContentById = deleteContentById;
const createPartModel = async (contentId, partData) => {
  return await CourseContent.updateOne(
    { _id: contentId },
    { $push: { contentItems: partData } },
  );
};
exports.createPartModel = createPartModel;
const addContentToPartModel = async (contentId, partId, newContent) => {
  return await CourseContent.updateOne(
    { _id: contentId, 'contentItems._id': partId },
    { $set: { 'contentItems.$.contentDetails': newContent } },
  );
};
exports.addContentToPartModel = addContentToPartModel;
const getContentPart = async (contentId, partId) => {
  return await CourseContent.findOne(
    { _id: contentId, 'contentItems._id': partId },
    { 'contentItems.$': 1 },
  );
};
exports.getContentPart = getContentPart;
const deletePartModel = async (contentId, partId) => {
  return await CourseContent.updateOne(
    { _id: contentId },
    { $pull: { contentItems: { _id: partId } } },
  );
};
exports.deletePartModel = deletePartModel;
const updateContentInPartModel = async (contentId, partId, updatedContent) => {
  return await CourseContent.updateOne(
    { _id: contentId, 'contentItems._id': partId },
    {
      $set: {
        'contentItems.$.sectionNumber': updatedContent.sectionNumber,
        'contentItems.$.contentDetails': updatedContent.contentDetails,
      },
    },
  );
};
exports.updateContentInPartModel = updateContentInPartModel;
// Add a single question to the quiz in course content
const addQuizQuestion = async (contentId, questionData) => {
  return await CourseContent.updateOne(
    { _id: contentId },
    { $push: { quiz: questionData } },
  );
};
exports.addQuizQuestion = addQuizQuestion;
// Update a single question within the quiz by question ID
const updateQuizQuestionById = async (
  contentId,
  questionId,
  updatedQuestionData,
) => {
  return await CourseContent.updateOne(
    { _id: contentId, 'quiz._id': questionId },
    { $set: { 'quiz.$': updatedQuestionData } },
  );
};
exports.updateQuizQuestionById = updateQuizQuestionById;
// Delete a single question from the quiz by question ID
const deleteQuizQuestionById = async (contentId, questionId) => {
  return await CourseContent.updateOne(
    { _id: contentId },
    { $pull: { quiz: { _id: questionId } } },
  );
};
exports.deleteQuizQuestionById = deleteQuizQuestionById;
// Add a single question to the assignment in course content
const addAssignmentQuestion = async (contentId, questionData) => {
  return await CourseContent.updateOne(
    { _id: contentId },
    { $push: { assignment: questionData } },
  );
};
exports.addAssignmentQuestion = addAssignmentQuestion;
// Update a single question within the assignment by question ID
const updateAssignmentQuestionById = async (
  contentId,
  questionId,
  updatedQuestionData,
) => {
  return await CourseContent.updateOne(
    { _id: contentId, 'assignment._id': questionId },
    { $set: { 'assignment.$': updatedQuestionData } },
  );
};
exports.updateAssignmentQuestionById = updateAssignmentQuestionById;
// Delete a single question from the assignment by question ID
const deleteAssignmentQuestionById = async (contentId, questionId) => {
  return await CourseContent.updateOne(
    { _id: contentId },
    { $pull: { assignment: { _id: questionId } } },
  );
};
exports.deleteAssignmentQuestionById = deleteAssignmentQuestionById;
