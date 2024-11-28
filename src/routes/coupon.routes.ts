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
import { authorizeRoles, isAuthenticated } from '../middleware/auth';
const router = express.Router();

router.get(
  '/',
  isAuthenticated,
  authorizeRoles('admin', 'super admin'),
  getAllCouponController,
);
router.get('/:couponId', getCouponByIdController);
router.get('/code/:couponCode', getCouponByCouponCodeController);
router.post(
  '/bulk',
  isAuthenticated,
  authorizeRoles('admin', 'super admin'),
  createBulkCouponController,
);
router.put('/:couponCode', validateCouponController);
router.delete(
  '/:couponId',
  isAuthenticated,
  authorizeRoles('admin', 'super admin'),
  deleteCouponController,
);
router.delete('/', isAuthenticated, deleteAllCouponController);

export default router;
