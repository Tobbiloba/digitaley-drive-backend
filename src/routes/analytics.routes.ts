import express from 'express';
import { getUsersAnalytics } from '../controller/analytics.controller';
import { authorizeRoles, isAuthenticated } from '../middleware/auth';
const analyticsRouter = express.Router();

analyticsRouter.get(
  '/',
  isAuthenticated,
  authorizeRoles('super admin'),
  getUsersAnalytics,
);

export default analyticsRouter;
