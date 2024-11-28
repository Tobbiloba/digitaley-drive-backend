"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const payment_controller_1 = require("../controller/payment.controller");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/initialize/:courseId', payment_controller_1.initializePayment);
router.post('/other-payment/:paymentId', auth_1.isAuthenticated, payment_controller_1.makeSecondPayment);
router.post('/update-payment-status/:paymentId', payment_controller_1.amountPaidStatus);
router.get('/', auth_1.isAuthenticated, (0, auth_1.authorizeRoles)('admin', 'super admin', 'teacher'), payment_controller_1.getAllPayments);
router.delete('/', auth_1.isAuthenticated, (0, auth_1.authorizeRoles)('admin', 'super admin', 'teacher'), payment_controller_1.deleteAllPaymentsController);
router.get('/:paymentId', auth_1.isAuthenticated, payment_controller_1.getPaymentByIdController);
exports.default = router;
