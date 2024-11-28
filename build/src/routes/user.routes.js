"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const user_controller_1 = require("../controller/user.controller");
const userRouter = express_1.default.Router();
userRouter.post('/login', user_controller_1.loginUserController);
userRouter.get('/logout', auth_1.isAuthenticated, user_controller_1.logoutUserController);
userRouter.put('/update-user-info', auth_1.isAuthenticated, user_controller_1.updateUserInfoController);
userRouter.put('/update-user-password', auth_1.isAuthenticated, user_controller_1.updatePasswordController);
userRouter.get('/get-users', auth_1.isAuthenticated, (0, auth_1.authorizeRoles)('admin', 'super admin'), user_controller_1.getAllUserController);
userRouter.delete('/:id', auth_1.isAuthenticated, (0, auth_1.authorizeRoles)('admin', 'super admin'), user_controller_1.deleteUserController);
userRouter.post('/register', auth_1.isAuthenticated, (0, auth_1.authorizeRoles)('admin', 'super admin'), user_controller_1.registerUserController);
exports.default = userRouter;
