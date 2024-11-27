"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsersAnalytics = void 0;
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const catchAsynchError_1 = __importDefault(require("../middleware/catchAsynchError"));
const user_model_1 = __importDefault(require("../models/user.model"));
// import OrderModel from "../models/order.Model";
const payment_model_1 = __importDefault(require("../models/payment.model"));
const analytics_generator_1 = require("../utils/analytics.generator");
exports.getUsersAnalytics = (0, catchAsynchError_1.default)(async (req, res, next) => {
    try {
        const users = await user_model_1.default.find();
        const userAnalytics = (0, analytics_generator_1.calculateUserAnalytics)(users);
        const payments = (await payment_model_1.default.find());
        const paymentAnalytics = await (0, analytics_generator_1.calculatePaymentAnalytics)(payments);
        res.status(200).json({
            success: true,
            data: {
                userAnalytics,
                paymentAnalytics,
            },
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
