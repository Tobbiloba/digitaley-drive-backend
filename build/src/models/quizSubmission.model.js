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
exports.deleteAllQuizSubmissionsModel =
  exports.deleteQuizSubmissionModel =
  exports.markQuizSubmissionModel =
  exports.createQuizSubmissionModel =
  exports.getQuizSubmissionsByStudentId =
  exports.getQuizSubmissionByIdModel =
  exports.getAllQuizSubmissionsModel =
  exports.quizSubmissionModel =
    void 0;
const mongoose_1 = __importStar(require('mongoose'));
const quizSubmissionSchema = new mongoose_1.Schema({
  studentId: {
    type: mongoose_1.default.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  contentId: {
    type: mongoose_1.default.Schema.Types.ObjectId,
    ref: 'CourseContent',
    required: true,
  },
  quizId: { type: mongoose_1.default.Schema.Types.ObjectId, required: true },
  answers: [
    {
      questionId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true,
      },
      answer: { type: String, required: true },
      explanation: { type: String, required: false },
    },
  ],
  score: { type: Number, default: 0 },
  submittedAt: { type: Date, default: Date.now },
  graded: { type: Boolean, default: false },
});
exports.quizSubmissionModel = mongoose_1.default.model(
  'QuizSubmission',
  quizSubmissionSchema,
);
const getAllQuizSubmissionsModel = async () => {
  return exports.quizSubmissionModel.find();
};
exports.getAllQuizSubmissionsModel = getAllQuizSubmissionsModel;
const getQuizSubmissionByIdModel = async (submissionId) => {
  return exports.quizSubmissionModel.findById(submissionId);
};
exports.getQuizSubmissionByIdModel = getQuizSubmissionByIdModel;
const getQuizSubmissionsByStudentId = async (studentId) => {
  return exports.quizSubmissionModel.find({ studentId });
};
exports.getQuizSubmissionsByStudentId = getQuizSubmissionsByStudentId;
const createQuizSubmissionModel = async (data) => {
  return exports.quizSubmissionModel.create(data);
};
exports.createQuizSubmissionModel = createQuizSubmissionModel;
const markQuizSubmissionModel = async (submissionId, score) => {
  return exports.quizSubmissionModel.findByIdAndUpdate(
    submissionId,
    { score, graded: true },
    { new: true },
  );
};
exports.markQuizSubmissionModel = markQuizSubmissionModel;
const deleteQuizSubmissionModel = async (submissionId) => {
  return exports.quizSubmissionModel.findByIdAndDelete(submissionId);
};
exports.deleteQuizSubmissionModel = deleteQuizSubmissionModel;
const deleteAllQuizSubmissionsModel = async () => {
  return exports.quizSubmissionModel.deleteMany();
};
exports.deleteAllQuizSubmissionsModel = deleteAllQuizSubmissionsModel;
exports.default = exports.quizSubmissionModel;
