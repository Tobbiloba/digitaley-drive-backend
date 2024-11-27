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
import { isAuthenticated } from '../middleware/auth';

const router = express.Router();

router.post(
  '/initialize/:courseId',
  // , isAuthenticated
  initializePayment,
);
// router.post("/update", isAuthenticated, updatePaymentInfo);
router.post('/other-payment/:paymentId', isAuthenticated, makeSecondPayment);
router.post(
  '/update-payment-status/:paymentId',
  //   isAuthenticated,
  amountPaidStatus,
);
router.get(
  '/',
  // , isAuthenticated
  getAllPayments,
);
router.delete(
  '/',
  // , isAuthenticated
  deleteAllPaymentsController,
);

router.get('/:paymentId', isAuthenticated, getPaymentByIdController);
export default router;
