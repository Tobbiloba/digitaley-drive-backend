"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAllModel = exports.updatePaymentModel = exports.getPaymenyByIdModel = exports.createPaymentModel = exports.getPaymentByIdModel = exports.getAllPaymentsModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const paymentSchema = new mongoose_1.Schema({
    courseId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
    payment_info: {
        courseName: { type: String, required: true },
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true },
        gender: { type: String, required: true },
        phoneNumber: { type: String },
        price: { type: Number, required: true },
        paymentType: { type: String, required: true },
        balance: { type: Number },
        custom_fields: { type: mongoose_1.Schema.Types.Mixed },
        email_sent: { type: Boolean, default: false },
        withInternship: { type: Boolean },
        coupon: {
            couponCode: { type: String },
            discount: { type: Number },
        },
        fullyPaid: { type: Boolean, default: false },
        amountPaid: [
            {
                amount: { type: Number, required: true },
                date: { type: Date, required: true },
                status: { type: String, required: true },
                reference_id: { type: String, required: true },
            },
        ],
        addedByAdmin: { type: Boolean, default: false },
    },
    status: { type: String, required: true },
}, { timestamps: true });
const PaymentModel = mongoose_1.default.model('Payment', paymentSchema);
const getAllPaymentsModel = async () => {
    return PaymentModel.find();
};
exports.getAllPaymentsModel = getAllPaymentsModel;
const getPaymentByIdModel = async (id) => {
    return PaymentModel.findById(id);
};
exports.getPaymentByIdModel = getPaymentByIdModel;
const createPaymentModel = async (data) => {
    return PaymentModel.create(data);
};
exports.createPaymentModel = createPaymentModel;
const getPaymenyByIdModel = async (id) => {
    return PaymentModel.findOne(id);
};
exports.getPaymenyByIdModel = getPaymenyByIdModel;
const updatePaymentModel = async (id, data) => {
    return PaymentModel.findByIdAndUpdate(id, data, {
        new: true,
    });
};
exports.updatePaymentModel = updatePaymentModel;
const deleteAllModel = async () => {
    return PaymentModel.deleteMany({});
};
exports.deleteAllModel = deleteAllModel;
exports.default = PaymentModel;
