"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const coupon_controller_1 = require("../controller/coupon.controller");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/', auth_1.isAuthenticated, (0, auth_1.authorizeRoles)('admin', 'super admin'), coupon_controller_1.getAllCouponController);
router.get('/:couponId', coupon_controller_1.getCouponByIdController);
router.get('/code/:couponCode', coupon_controller_1.getCouponByCouponCodeController);
router.post('/bulk', auth_1.isAuthenticated, (0, auth_1.authorizeRoles)('admin', 'super admin'), coupon_controller_1.createBulkCouponController);
router.put('/:couponCode', coupon_controller_1.validateCouponController);
router.delete('/:couponId', auth_1.isAuthenticated, (0, auth_1.authorizeRoles)('admin', 'super admin'), coupon_controller_1.deleteCouponController);
router.delete('/', auth_1.isAuthenticated, coupon_controller_1.deleteAllCouponController);
exports.default = router;
