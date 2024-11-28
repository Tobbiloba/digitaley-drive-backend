"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAllCouponController = exports.deleteCouponController = exports.validateCouponController = exports.createBulkCouponController = exports.getCouponByCouponCodeController = exports.getCouponByIdController = exports.getAllCouponController = void 0;
const catchAsynchError_1 = __importDefault(require("../middleware/catchAsynchError"));
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const coupon_model_1 = require("../models/coupon.model");
const generate_coupon_code_1 = require("../utils/generate-coupon-code");
exports.getAllCouponController = (0, catchAsynchError_1.default)(async (req, res, next) => {
    try {
        const coupons = await (0, coupon_model_1.getAllCouponModel)();
        res.status(200).json({
            success: true,
            data: coupons,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
exports.getCouponByIdController = (0, catchAsynchError_1.default)(async (req, res, next) => {
    try {
        const { couponId } = req.params;
        const coupon = await (0, coupon_model_1.getCouponByIdModel)(couponId);
        if (!coupon) {
            return next(new ErrorHandler_1.default('Coupon not found', 404));
        }
        res.status(200).json({
            success: true,
            data: coupon,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
exports.getCouponByCouponCodeController = (0, catchAsynchError_1.default)(async (req, res, next) => {
    try {
        const { couponCode } = req.params;
        const coupon = await (0, coupon_model_1.getCouponByCouponCodeModel)(couponCode);
        if (!coupon) {
            return next(new ErrorHandler_1.default('Coupon not found', 404));
        }
        res.status(200).json({
            success: true,
            data: coupon,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
exports.createBulkCouponController = (0, catchAsynchError_1.default)(async (req, res, next) => {
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
        const couponCodes = Array.from({ length: quantity }, () => (0, generate_coupon_code_1.generateCouponCode)().toUpperCase());
        // Create coupons and save them to the database
        const coupons = await Promise.all(couponCodes.map(async (code) => {
            return await (0, coupon_model_1.createCouponModel)({
                code,
                status: 'active',
                discount,
            });
        }));
        // Send the created coupons as a response
        return res.status(201).json({
            success: true,
            coupons,
        });
    }
    catch (error) {
        console.error('Error creating bulk coupons:', error);
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
exports.validateCouponController = (0, catchAsynchError_1.default)(async (req, res, next) => {
    try {
        const { couponCode } = req.params;
        if (!couponCode) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a coupon code',
            });
        }
        let coupon = await (0, coupon_model_1.getCouponByCouponCodeModel)(couponCode);
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
        await (0, coupon_model_1.updateCouponStatusModel)(coupon.code, 'expired');
        res.status(200).json({
            success: true,
            coupon,
            message: 'Coupon updated successfully',
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
exports.deleteCouponController = (0, catchAsynchError_1.default)(async (req, res, next) => {
    try {
        const { couponId } = req.params;
        await (0, coupon_model_1.deleteCouponModel)(couponId);
        res.status(200).json({
            success: true,
            message: 'Coupon deleted successfully',
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
exports.deleteAllCouponController = (0, catchAsynchError_1.default)(async (req, res, next) => {
    try {
        await (0, coupon_model_1.deleteAllCouponModel)();
        res.status(200).json({
            success: true,
            message: 'All coupons deleted successfully',
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
