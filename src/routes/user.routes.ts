import express from 'express';
import { authorizeRoles, isAuthenticated } from '../middleware/auth';
import {
  loginUserController,
  logoutUserController,
  updateUserInfoController,
  updatePasswordController,
  getAllUserController,
  deleteUserController,
  registerUserController,
} from '../controller/user.controller';
const userRouter = express.Router();

userRouter.post('/login', loginUserController);
userRouter.get('/logout', isAuthenticated, logoutUserController);
userRouter.put('/update-user-info', isAuthenticated, updateUserInfoController);
userRouter.put(
  '/update-user-password',
  isAuthenticated,
  updatePasswordController,
);
userRouter.get(
  '/get-users',
  isAuthenticated,
  authorizeRoles('admin', 'super admin'),
  getAllUserController,
);
userRouter.delete(
  '/:id',
  isAuthenticated,
  authorizeRoles('admin', 'super admin'),
  deleteUserController,
);
userRouter.post(
  '/register',
  isAuthenticated,
  authorizeRoles('admin', 'super admin'),
  registerUserController,
);

export default userRouter;
