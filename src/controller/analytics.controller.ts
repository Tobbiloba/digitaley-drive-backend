import { Request, Response, NextFunction } from 'express';
import ErrorHandler from '../utils/ErrorHandler';
import CatchAsyncError from '../middleware/catchAsynchError';
import { getAllCoursesModel } from '../models/course.model';
import userModel from '../models/user.model';
// import OrderModel from "../models/order.Model";
import PaymentModel from '../models/payment.model';
import {
  calculateUserAnalytics,
  calculatePaymentAnalytics,
  Payment,
} from '../utils/analytics.generator';

export const getUsersAnalytics = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await userModel.find();
      const userAnalytics = calculateUserAnalytics(users);
      const payments = (await PaymentModel.find()) as Payment[];

      const paymentAnalytics = await calculatePaymentAnalytics(payments);
      res.status(200).json({
        success: true,
        data: {
          userAnalytics,
          paymentAnalytics,
        },
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);
