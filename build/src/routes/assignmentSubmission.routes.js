"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const assignmentSubmission_1 = require("../controller/assignmentSubmission");
const router = express_1.default.Router();
router.get('/assignments', assignmentSubmission_1.getAllSubmissionController);
router.get('/assignments/:id', assignmentSubmission_1.getAllSubmissionByIdController);
router.post('/assignments', assignmentSubmission_1.createAssignmentController);
router.patch('/assignments/:submissionId/mark/:score', assignmentSubmission_1.markAssignmentSubmissionController);
router.put('/assignments/:submissionId', assignmentSubmission_1.updateAssignmentSubmissionController);
router.delete('/assignments/:submissionId', assignmentSubmission_1.deleteAssignmentSubmissionByIdController);
router.delete('/assignments', assignmentSubmission_1.deleteAllAssignmentSubmissionController);
exports.default = router;
