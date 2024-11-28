"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAllModel = exports.updateUserModel = exports.deleteUserModel = exports.createUserModel = exports.getUserByEmailModel = exports.getUserByIdModel = exports.getAllUsersModel = void 0;
require('dotenv').config();
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const emailRegexPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const userSchema = new mongoose_1.default.Schema({
    firstName: {
        type: String,
    },
    lastName: {
        type: String,
    },
    gender: {
        type: String,
    },
    phoneNumber: {
        type: String,
        required: [false, 'Please input Phone Number'],
    },
    paymentStatus: {
        type: String,
        enum: ['completed', 'part'],
    },
    balance: { type: Number },
    emailSent: {
        type: Boolean,
        default: false,
    },
    email: {
        type: String,
        required: [true, 'Please enter your email'],
        validate: {
            validator: function (value) {
                return emailRegexPattern.test(value);
            },
            message: 'Please enter a valid email',
        },
        unique: true,
    },
    authentication: {
        password: { type: String, required: true, select: false },
        salt: { type: String, required: true, select: false },
    },
    avatar: {
        type: String,
    },
    role: {
        type: String,
        default: 'user',
    },
    isPasswordChanged: {
        type: Boolean,
    },
    courses: [
        {
            courseId: String,
        },
    ],
    editCourse: [
        {
            courseId: String,
        },
    ],
}, { timestamps: true });
// sign access token
userSchema.methods.SignAccessToken = function () {
    return jsonwebtoken_1.default.sign({ id: this._id }, process.env.ACCESS_TOKEN || '', {
        expiresIn: '5m',
    });
};
// sign refresh token
userSchema.methods.SignRefreshToken = function () {
    return jsonwebtoken_1.default.sign({ id: this._id }, process.env.REFRESH_TOKEN || '', {
        expiresIn: '3d',
    });
};
// compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcryptjs_1.default.compare(enteredPassword, this.password);
};
const userModel = mongoose_1.default.model('User', userSchema);
const getAllUsersModel = async () => {
    return userModel.find();
};
exports.getAllUsersModel = getAllUsersModel;
const getUserByIdModel = async (id) => {
    return userModel.findById(id).populate('courses.courseId').exec();
};
exports.getUserByIdModel = getUserByIdModel;
const getUserByEmailModel = async (email) => {
    return userModel.findOne({ email }).populate('courses.courseId').exec();
};
exports.getUserByEmailModel = getUserByEmailModel;
const createUserModel = async (data) => {
    return userModel.create(data);
};
exports.createUserModel = createUserModel;
const deleteUserModel = async (id) => {
    return userModel.findByIdAndDelete(id);
};
exports.deleteUserModel = deleteUserModel;
const updateUserModel = async (id, data) => {
    return userModel.findByIdAndUpdate(id, data, { new: true });
};
exports.updateUserModel = updateUserModel;
const deleteAllModel = async () => {
    return userModel.deleteMany({});
};
exports.deleteAllModel = deleteAllModel;
exports.default = userModel;
