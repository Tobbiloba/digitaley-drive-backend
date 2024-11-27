import { Request, Response, NextFunction } from 'express';
import CatchAsyncError from '../middleware/catchAsynchError';
import ErrorHandler from '../utils/ErrorHandler';
import {
  getAllCouponModel,
  getCouponByCouponCodeModel,
  getCouponByIdModel,
  createCouponModel,
  updateCouponStatusModel,
  deleteCouponModel,
  deleteAllCouponModel,
} from '../models/coupon.model';
import { ICoupon } from '../../@types/coupon';
import { generateCouponCode } from '../utils/generate-coupon-code';

export const getAllCouponController = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const coupons = await getAllCouponModel();
      res.status(200).json({
        success: true,
        data: coupons,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

export const getCouponByIdController = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { couponId } = req.params;
      const coupon = await getCouponByIdModel(couponId);
      if (!coupon) {
        return next(new ErrorHandler('Coupon not found', 404));
      }
      res.status(200).json({
        success: true,
        data: coupon,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

export const getCouponByCouponCodeController = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { couponCode } = req.params;
      const coupon = await getCouponByCouponCodeModel(couponCode);
      if (!coupon) {
        return next(new ErrorHandler('Coupon not found', 404));
      }
      res.status(200).json({
        success: true,
        data: coupon,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

export const createBulkCouponController = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { quantity, discount } = req.body;

      // Ensure quantity is defined
      if (!quantity || quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Quantity must be a positive number.',
        });
      }

      // Generate multiple coupon codes
      const couponCodes = Array.from({ length: quantity }, () =>
        generateCouponCode().toUpperCase(),
      );

      // Create coupons and save them to the database
      const coupons = await Promise.all(
        couponCodes.map(async (code) => {
          return await createCouponModel({
            code,
            status: 'active',
            discount,
          });
        }),
      );

      // Send the created coupons as a response
      return res.status(201).json({
        success: true,
        coupons,
      });
    } catch (error: any) {
      console.error('Error creating bulk coupons:', error);
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

export const validateCouponController = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { couponCode } = req.params;
      if (!couponCode) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a coupon code',
        });
      }

      let coupon = await getCouponByCouponCodeModel(couponCode);

      if (!coupon) {
        return res.status(400).json({
          success: false,
          message: 'Coupon not found',
        });
      }

      if (coupon && coupon.status === 'expired') {
        return res.status(400).json({
          success: false,
          message: 'Coupon has expired',
        });
      }

      await updateCouponStatusModel(coupon.code, 'expired');

      res.status(200).json({
        success: true,
        coupon,
        message: 'Coupon updated successfully',
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

export const deleteCouponController = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { couponId } = req.params;
      await deleteCouponModel(couponId);

      res.status(200).json({
        success: true,
        message: 'Coupon deleted successfully',
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

export const deleteAllCouponController = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await deleteAllCouponModel();

      res.status(200).json({
        success: true,
        message: 'All coupons deleted successfully',
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);
