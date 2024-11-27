"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAllAssignmentSubmissionsModel = exports.deleteAssignmentSubmissionModel = exports.updateAssignmentSubmissionModel = exports.markAssignmentSubmissionModel = exports.createAssignmentSubmissionModel = exports.getAssignmentSubmissionByIdModel = exports.getAllAssignmentSubmissionsModel = exports.assignmentSubmissionModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const assignmentSubmissionSchema = new mongoose_1.Schema({
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
    assignmentId: { type: mongoose_1.default.Schema.Types.ObjectId, required: true },
    answer: { type: String, required: true },
    score: { type: Number, default: 0 },
    submittedAt: { type: Date, default: Date.now },
    graded: { type: Boolean, default: false },
});
exports.assignmentSubmissionModel = mongoose_1.default.model('AssignmentSubmission', assignmentSubmissionSchema);
const getAllAssignmentSubmissionsModel = async () => {
    return exports.assignmentSubmissionModel.find();
};
exports.getAllAssignmentSubmissionsModel = getAllAssignmentSubmissionsModel;
const getAssignmentSubmissionByIdModel = async (submissionId) => {
    return exports.assignmentSubmissionModel.findById(submissionId);
};
exports.getAssignmentSubmissionByIdModel = getAssignmentSubmissionByIdModel;
const createAssignmentSubmissionModel = async (data) => {
    return exports.assignmentSubmissionModel.create(data);
};
exports.createAssignmentSubmissionModel = createAssignmentSubmissionModel;
const markAssignmentSubmissionModel = async (submissionId, score) => {
    return exports.assignmentSubmissionModel.findByIdAndUpdate(submissionId, { score, graded: true }, { new: true });
};
exports.markAssignmentSubmissionModel = markAssignmentSubmissionModel;
const updateAssignmentSubmissionModel = async (submissionId, updatedData) => {
    return exports.assignmentSubmissionModel.findByIdAndUpdate(submissionId, updatedData, { new: true });
};
exports.updateAssignmentSubmissionModel = updateAssignmentSubmissionModel;
const deleteAssignmentSubmissionModel = async (submissionId) => {
    return exports.assignmentSubmissionModel.findByIdAndDelete(submissionId);
};
exports.deleteAssignmentSubmissionModel = deleteAssignmentSubmissionModel;
const deleteAllAssignmentSubmissionsModel = async () => {
    return exports.assignmentSubmissionModel.deleteMany();
};
exports.deleteAllAssignmentSubmissionsModel = deleteAllAssignmentSubmissionsModel;
exports.default = exports.assignmentSubmissionModel;
