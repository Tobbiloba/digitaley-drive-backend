import express from 'express';
import {
  getAllCouponController,
  getCouponByCouponCodeController,
  getCouponByIdController,
  validateCouponController,
  deleteCouponController,
  createBulkCouponController,
  deleteAllCouponController,
} from '../controller/coupon.controller';
import { isAuthenticated } from '../middleware/auth';
const router = express.Router();

router.get(
  '/',
  // , isAuthenticated
  getAllCouponController,
);
router.get(
  '/:couponId',
  // , isAuthenticated
  getCouponByIdController,
);
router.get(
  '/code/:couponCode',
  //   isAuthenticated,
  getCouponByCouponCodeController,
);
router.post(
  '/bulk',
  // , isAuthenticated
  createBulkCouponController,
);
router.put(
  '/:couponCode',
  // ,
  //  isAuthenticated
  validateCouponController,
);
router.delete(
  '/:couponId',
  // , isAuthenticated
  deleteCouponController,
);
router.delete('/', isAuthenticated, deleteAllCouponController);

export default router;
