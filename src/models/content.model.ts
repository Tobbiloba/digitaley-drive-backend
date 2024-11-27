import mongoose, { Document, Schema } from 'mongoose';
import { ICourseContent } from '../../@types/content';

// Define the schema for hyperlinks
const HyperlinkSchema: Schema = new Schema({
  linkTitle: { type: String, required: false },
  linkUrl: { type: String, required: false },
});

// Define the schema for content details
const ContentDetailSchema: Schema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
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
const ContentItemSchema: Schema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
  },
  sectionNumber: { type: Number, required: true },
  contentDetails: { type: ContentDetailSchema, required: true },
});

// Define the schema for assignment questions
const AssignmentQuestionsSchema: Schema = new Schema({
  question: { type: String, required: true },
});

// Define the schema for quiz questions
const QuestionSchema: Schema = new Schema({
  question: { type: String, required: true },
  options: { type: [String], required: false },
  answer: { type: String, required: true },
});

// Define the main course content schema
const CourseContentSchema: Schema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
  },
  contentItems: { type: [ContentItemSchema], default: [] },
  likeCount: { type: Number, default: 0 },
  dislikeCount: { type: Number, default: 0 },
  courseIdentifier: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: false,
  },
  visibility: { type: Boolean, default: false },
  date: { type: Date, default: Date.now },
  assignment: { type: [AssignmentQuestionsSchema], default: [] },
  quiz: { type: [QuestionSchema], default: [] },
});

// Create the CourseContent model
const CourseContent = mongoose.model<ICourseContent & Document>(
  'CourseContent',
  CourseContentSchema,
);
export default CourseContent;

// Model functions

export const getAllContents = async () => {
  return await CourseContent.find();
};

export const getContentById = async (contentId: string) => {
  return await CourseContent.findById(contentId);
};

export const getContentByCourseId = async (courseId: string) => {
  return await CourseContent.findOne({ courseIdentifier: courseId });
};

export const createContent = async () => {
  return await CourseContent.create({});
};

export const deleteContentById = async (contentId: string) => {
  return await CourseContent.findByIdAndDelete(contentId);
};

export const createPartModel = async (contentId: string, partData: any) => {
  return await CourseContent.updateOne(
    { _id: contentId },
    { $push: { contentItems: partData } },
  );
};

export const addContentToPartModel = async (
  contentId: string,
  partId: string,
  newContent: any,
) => {
  return await CourseContent.updateOne(
    { _id: contentId, 'contentItems._id': partId },
    { $set: { 'contentItems.$.contentDetails': newContent } },
  );
};

export const getContentPart = async (contentId: string, partId: string) => {
  return await CourseContent.findOne(
    { _id: contentId, 'contentItems._id': partId },
    { 'contentItems.$': 1 },
  );
};

export const deletePartModel = async (contentId: string, partId: string) => {
  return await CourseContent.updateOne(
    { _id: contentId },
    { $pull: { contentItems: { _id: partId } } },
  );
};

export const updateContentInPartModel = async (
  contentId: string,
  partId: string,
  updatedContent: any,
) => {
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

// Add a single question to the quiz in course content
export const addQuizQuestion = async (contentId: string, questionData: any) => {
  return await CourseContent.updateOne(
    { _id: contentId },
    { $push: { quiz: questionData } },
  );
};

// Update a single question within the quiz by question ID
export const updateQuizQuestionById = async (
  contentId: string,
  questionId: string,
  updatedQuestionData: any,
) => {
  return await CourseContent.updateOne(
    { _id: contentId, 'quiz._id': questionId },
    { $set: { 'quiz.$': updatedQuestionData } },
  );
};

// Delete a single question from the quiz by question ID
export const deleteQuizQuestionById = async (
  contentId: string,
  questionId: string,
) => {
  return await CourseContent.updateOne(
    { _id: contentId },
    { $pull: { quiz: { _id: questionId } } },
  );
};

// Add a single question to the assignment in course content
export const addAssignmentQuestion = async (
  contentId: string,
  questionData: any,
) => {
  return await CourseContent.updateOne(
    { _id: contentId },
    { $push: { assignment: questionData } },
  );
};

// Update a single question within the assignment by question ID
export const updateAssignmentQuestionById = async (
  contentId: string,
  questionId: string,
  updatedQuestionData: any,
) => {
  return await CourseContent.updateOne(
    { _id: contentId, 'assignment._id': questionId },
    { $set: { 'assignment.$': updatedQuestionData } },
  );
};

// Delete a single question from the assignment by question ID
export const deleteAssignmentQuestionById = async (
  contentId: string,
  questionId: string,
) => {
  return await CourseContent.updateOne(
    { _id: contentId },
    { $pull: { assignment: { _id: questionId } } },
  );
};
