import express from 'express';
import {
  initializePayment,
  updatePaymentInfo,
  makeSecondPayment,
  amountPaidStatus,
  getAllPayments,
  deleteAllPaymentsController,
  getPaymentByIdController,
} from '../controller/payment.controller';
import { isAuthenticated, authorizeRoles } from '../middleware/auth';

const router = express.Router();

router.post('/initialize/:courseId', initializePayment);
router.post('/other-payment/:paymentId', isAuthenticated, makeSecondPayment);
router.post('/update-payment-status/:paymentId', amountPaidStatus);
router.get(
  '/',
  isAuthenticated,
  authorizeRoles('admin', 'super admin', 'teacher'),
  getAllPayments,
);
router.delete(
  '/',
  isAuthenticated,
  authorizeRoles('admin', 'super admin', 'teacher'),
  deleteAllPaymentsController,
);

router.get('/:paymentId', isAuthenticated, getPaymentByIdController);
export default router;
