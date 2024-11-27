"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const progress_controller_1 = require("../controller/progress.controller");
const router = express_1.default.Router();
router.get('/', auth_1.isAuthenticated, progress_controller_1.getAllProgressController);
router.post('/:contentId', auth_1.isAuthenticated, progress_controller_1.createProgressController);
router.get('/user/:userId', auth_1.isAuthenticated, progress_controller_1.getProgressByUserIdController);
router.get('/:progressId', auth_1.isAuthenticated, progress_controller_1.getProgressByIdController);
router.get('/:contentId/user/', auth_1.isAuthenticated, progress_controller_1.getProgressByContentAndUserIdController);
router.post('/reset', auth_1.isAuthenticated, progress_controller_1.resetProgressController);
router.delete('/delete-all', auth_1.isAuthenticated, progress_controller_1.deleteAllProgressController);
router.delete('/:progressId', auth_1.isAuthenticated, progress_controller_1.deleteProgressController);
router.put('/:contentId/subContent/:subContentId', auth_1.isAuthenticated, progress_controller_1.updateContentProgressController);
exports.default = router;
