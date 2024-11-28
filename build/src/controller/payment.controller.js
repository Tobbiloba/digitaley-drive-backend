"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserPayment = exports.addUserPayment = exports.getPaymentByIdController = exports.deleteAllPaymentsController = exports.makeSecondPayment = exports.amountPaidStatus = exports.updatePaymentInfo = exports.initializePayment = exports.getAllPayments = void 0;
const catchAsynchError_1 = __importDefault(require("../middleware/catchAsynchError"));
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const uuid_1 = require("uuid");
const course_model_1 = require("../models/course.model");
const user_model_1 = require("../models/user.model");
const payment_model_1 = require("../models/payment.model");
const coupon_model_1 = require("../models/coupon.model");
const user_controller_1 = require("./user.controller");
const payment_model_2 = __importDefault(require("../models/payment.model"));
const axios_1 = __importDefault(require("axios"));
exports.getAllPayments = (0, catchAsynchError_1.default)(async (req, res, next) => {
    try {
        const payments = await (0, payment_model_1.getAllPaymentsModel)();
        return res.status(200).json({
            success: true,
            data: payments,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
exports.initializePayment = (0, catchAsynchError_1.default)(async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const { firstName, lastName, phoneNumber, email, reference_id, gender, custom_fields, paymentType, withInternship, couponCode, } = req.body;
        const course = await (0, course_model_1.getCourseByIdModel)(courseId);
        if (!course) {
            return next(new ErrorHandler_1.default('Course not found', 404));
        }
        const user = await (0, user_model_1.getUserByEmailModel)(email);
        if (user && user.courses.some((c) => c.courseId === courseId)) {
            return res.status(400).json({
                success: false,
                message: 'You have already registered for this course',
            });
        }
        let amountToBePaid = req.body.amountToBePaid;
        const totalPrice = withInternship
            ? course.courseInfo.pricing.withInternship.priceNGN
            : course.courseInfo.pricing.withoutInternship.priceNGN;
        let couponDiscount = 0;
        let coupon;
        if (couponCode) {
            coupon = await (0, coupon_model_1.getCouponByCouponCodeModel)(couponCode);
            if (coupon) {
                const discountPercent = coupon.discount;
                couponDiscount = (discountPercent / 100) * totalPrice;
                if (discountPercent === 100) {
                    amountToBePaid = 0;
                }
                (0, coupon_model_1.deleteCouponModel)(coupon._id);
            }
        }
        if (paymentType === 'full') {
            amountToBePaid = totalPrice;
        }
        const balance = totalPrice - couponDiscount - amountToBePaid;
        const paymentData = {
            courseId,
            userId: (0, uuid_1.v4)(),
            payment_info: {
                courseName: course.name,
                firstName,
                lastName,
                phoneNumber,
                email,
                gender,
                price: totalPrice,
                custom_fields,
                email_sent: false,
                paymentType,
                coupon: {
                    couponCode: couponCode && coupon ? couponCode : '',
                    discount: couponDiscount ? couponDiscount : 0,
                },
                balance,
                fullyPaid: amountToBePaid >= balance,
                withInternship,
                amountPaid: [
                    {
                        amount: amountToBePaid,
                        date: new Date().toISOString(),
                        reference_id,
                        status: 'pending',
                    },
                ],
            },
            status: 'pending',
        };
        const payment = await (0, payment_model_1.createPaymentModel)(paymentData);
        return res.status(200).json({ message: 'Payment Initialized', payment });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
const verifyPaymentStatus = async (referenceId) => {
    try {
        const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
        if (!paystackSecretKey) {
            throw new Error('Paystack Secret Key not found in environment variables');
        }
        const paystackUrl = `https://api.paystack.co/transaction/verify/${referenceId}`;
        const authorization = `Bearer ${paystackSecretKey}`;
        console.log({ paystackUrl, authorization });
        const response = await axios_1.default.get(paystackUrl, {
            headers: {
                Authorization: authorization,
            },
        });
        // Check if the response status is success and payment status is successful
        if (response.data.status && response.data.data.status === 'success') {
            return true;
        }
        else {
            return false;
        }
    }
    catch (error) {
        console.error('Error verifying payment status:', error.response);
        throw new Error('Payment verification failed');
    }
};
exports.updatePaymentInfo = (0, catchAsynchError_1.default)(async (req, res, next) => {
    try {
        const { paymentId } = req.params;
        const { reference_id, status, amountPaid } = req.body;
        if (!status || !reference_id) {
            return res
                .status(400)
                .json({ message: 'Pass in necessary parameters' });
        }
        const payment = await (0, payment_model_1.getPaymentByIdModel)(paymentId);
        if (!payment) {
            return res.status(404).json({ message: 'Payment ID invalid' });
        }
        const isPaymentSuccessful = await verifyPaymentStatus(reference_id);
        if (!isPaymentSuccessful) {
            return next(new ErrorHandler_1.default('Payment verification failed or payment was not successful', 400));
        }
        let couponDiscount = 0;
        if (payment.payment_info.coupon.couponCode) {
            const coupon = await (0, coupon_model_1.getCouponByCouponCodeModel)(payment.payment_info.coupon.couponCode);
            if (coupon) {
                couponDiscount = (coupon.discount / 100) * payment.payment_info.price;
            }
        }
        const totalAmountPaid = payment.payment_info.amountPaid.reduce((sum, payment) => sum + payment.amount, 0) + amountPaid;
        let fullyPaid = false;
        let remainingBalance = payment.payment_info.price - totalAmountPaid;
        if (totalAmountPaid >= payment.payment_info.price) {
            fullyPaid = true;
            remainingBalance = 0;
        }
        payment.payment_info.amountPaid.push({
            amount: amountPaid,
            date: new Date(),
            reference_id,
            status: 'pending',
        });
        payment.payment_info.fullyPaid = fullyPaid;
        payment.payment_info.balance = remainingBalance;
        payment.status = fullyPaid ? 'success' : 'pending';
        await (0, payment_model_1.updatePaymentModel)(paymentId, payment);
        const userExist = await (0, user_model_1.getUserByEmailModel)(payment.payment_info.email);
        if (!userExist) {
            const userData = {
                firstName: payment.payment_info.firstName,
                lastName: payment.payment_info.lastName,
                email: payment.payment_info.email,
                phoneNumber: payment.payment_info.phoneNumber,
                course: payment.courseId,
                balance: remainingBalance,
            };
            // Assuming logic to save user data
            // saveUserData(userData);
        }
        return res.status(200).json({ message: 'Payment updated successfully' });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
exports.amountPaidStatus = (0, catchAsynchError_1.default)(async (req, res, next) => {
    try {
        const { paymentId } = req.params;
        const { reference_id } = req.body;
        console.log('called');
        const payment = await (0, payment_model_1.getPaymentByIdModel)(paymentId);
        if (!payment) {
            return next(new ErrorHandler_1.default('Payment not found', 404));
        }
        if (!reference_id) {
            return res
                .status(400)
                .json({ message: 'Pass in necessary parameters' });
        }
        const isPaymentSuccessful = await verifyPaymentStatus(reference_id);
        if (!isPaymentSuccessful) {
            return next(new ErrorHandler_1.default('Payment verification failed or payment was not successful', 400));
        }
        const paymentEntry = payment.payment_info.amountPaid.find((entry) => entry.reference_id === reference_id);
        if (!paymentEntry) {
            return next(new ErrorHandler_1.default('Payment entry not found with the provided reference ID', 404));
        }
        const existingAmount = paymentEntry.amount;
        paymentEntry.date = new Date();
        paymentEntry.status = 'successful'; // Update status to successful
        const totalAmountPaid = payment.payment_info.amountPaid.reduce((acc, entry) => acc + entry.amount, 0); // Total after updating the specific entry
        const totalPrice = payment.payment_info.price;
        payment.payment_info.balance = Math.max(totalPrice - totalAmountPaid, 0); // Ensure balance doesn't go negative
        payment.payment_info.fullyPaid = totalAmountPaid >= totalPrice;
        if (!payment.payment_info.accountCreated) {
            // Create user account on full or partial payment
            const userData = {
                firstName: payment.payment_info.firstName,
                lastName: payment.payment_info.lastName,
                email: payment.payment_info.email,
                phoneNumber: payment.payment_info.phoneNumber,
                // courses: [{ courseId: payment.courseId }],
                courseId: payment.courseId,
                gender: payment.payment_info.gender,
                role: 'user',
                balance: payment.payment_info.balance,
            };
            try {
                const createAccount = await (0, user_controller_1.registerUserFunc)({ ...userData });
                console.log('create account', createAccount);
            }
            catch (error) {
                return res.status(500).json({
                    message: 'An error occured',
                });
            }
        }
        await (0, payment_model_1.updatePaymentModel)(paymentId, payment);
        return res.status(200).json({
            message: 'Payment status updated successfully',
            data: payment,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
exports.makeSecondPayment = (0, catchAsynchError_1.default)(async (req, res, next) => {
    try {
        const { paymentId } = req.params;
        const { reference_id, amountPaid } = req.body;
        if (!reference_id || !amountPaid) {
            return res
                .status(400)
                .json({ message: 'Pass in necessary parameters' });
        }
        const payment = await (0, payment_model_1.getPaymentByIdModel)(paymentId);
        if (!payment) {
            return res.status(404).json({ message: 'Payment ID invalid' });
        }
        if (payment.payment_info.fullyPaid) {
            return res
                .status(400)
                .json({ message: 'This payment is already fully settled.' });
        }
        const totalAmountPaid = payment.payment_info.amountPaid.reduce((sum, pmt) => sum + pmt.amount, 0) + amountPaid;
        const remainingBalance = payment.payment_info.price - totalAmountPaid;
        let fullyPaid = totalAmountPaid >= payment.payment_info.price;
        payment.payment_info.amountPaid.push({
            amount: amountPaid,
            date: new Date(),
            reference_id,
            status: 'pending',
        });
        payment.payment_info.fullyPaid = fullyPaid;
        payment.payment_info.balance = fullyPaid ? 0 : remainingBalance;
        payment.status = fullyPaid ? 'success' : 'pending';
        await (0, payment_model_1.updatePaymentModel)(paymentId, payment);
        if (fullyPaid) {
            const user = await (0, user_model_1.getUserByEmailModel)(payment.payment_info.email);
            if (user) {
                user.courses.push({ courseId: payment.courseId.toString() });
                await user.save();
            }
        }
        return res.status(200).json({
            message: fullyPaid
                ? 'Payment fully settled and account updated'
                : 'Payment received, remaining balance exists',
            payment,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
exports.deleteAllPaymentsController = (0, catchAsynchError_1.default)(async (req, res, next) => {
    try {
        await (0, payment_model_1.deleteAllModel)();
        res.status(200).json({
            success: true,
            message: 'All payments deleted successfully',
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
exports.getPaymentByIdController = (0, catchAsynchError_1.default)(async (req, res, next) => {
    try {
        const { paymentId } = req.params;
        console.log(paymentId);
        const payment = await (0, payment_model_1.getPaymentByIdModel)(paymentId);
        return res.status(200).json({
            success: true,
            data: payment,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
const addUserPayment = async ({ email, courseId, amountPaid, withInternship, }) => {
    try {
        const course = await (0, course_model_1.getCourseByIdModel)(courseId);
        // const payment = await PaymentModel.findOne({ "payment_info.email": email });
        // console.log(payment)
        if (!course) {
            throw new Error(`No course record found for courseId: ${courseId}`);
        }
        // // Prepare updated data
        const paymentData = {
            courseId,
            userId: (0, uuid_1.v4)(),
            payment_info: {
                courseName: course.name,
                firstName: 'null',
                lastName: 'null',
                phoneNumber: 'null',
                email,
                gender: 'null',
                price: amountPaid,
                addedByAdmin: true,
                paymentType: 'full',
                balance: 0,
                fullyPaid: true,
                withInternship,
                amountPaid: [
                    {
                        amount: amountPaid,
                        date: new Date().toISOString(),
                        reference_id: 'null',
                        status: 'successful',
                    },
                ],
            },
            status: 'success',
        };
        const paymentCreated = await (0, payment_model_1.createPaymentModel)(paymentData);
        // // Update the payment record
        console.log(paymentCreated);
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`Error updating payment info for email: ${email} - ${error.message}`);
        }
        else {
            console.error('Unexpected error occurred:', error);
        }
    }
};
exports.addUserPayment = addUserPayment;
const updateUserPayment = async ({ email, firstName, lastName, phoneNumber, gender, }) => {
    try {
        // Find the payment record by email
        const payment = await payment_model_2.default.findOne({ 'payment_info.email': email });
        if (!payment) {
            throw new Error(`No payment record found for email: ${email}`);
        }
        // Get the paymentId as a string (if it exists)
        const paymentId = payment._id.toString();
        // Prepare updated data
        const updatedInfo = {
            firstName,
            lastName,
            phoneNumber,
            gender,
        };
        // Merge updated data into the payment_info object
        payment.payment_info = {
            ...payment.payment_info,
            ...updatedInfo,
        };
        // Update the payment record
        await (0, payment_model_1.updatePaymentModel)(paymentId, payment);
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`Error updating payment info for email: ${email} - ${error.message}`);
        }
        else {
            console.error('Unexpected error occurred:', error);
        }
    }
};
exports.updateUserPayment = updateUserPayment;
