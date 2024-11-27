"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const payment_controller_1 = require("../controller/payment.controller");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/initialize/:courseId', 
// , isAuthenticated
payment_controller_1.initializePayment);
// router.post("/update", isAuthenticated, updatePaymentInfo);
router.post('/other-payment/:paymentId', auth_1.isAuthenticated, payment_controller_1.makeSecondPayment);
router.post('/update-payment-status/:paymentId', 
//   isAuthenticated,
payment_controller_1.amountPaidStatus);
router.get('/', 
// , isAuthenticated
payment_controller_1.getAllPayments);
router.delete('/', 
// , isAuthenticated
payment_controller_1.deleteAllPaymentsController);
router.get('/:paymentId', auth_1.isAuthenticated, payment_controller_1.getPaymentByIdController);
exports.default = router;
