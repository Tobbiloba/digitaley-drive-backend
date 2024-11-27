require('dotenv').config();
import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { IUser } from '../../@types/user';
const emailRegexPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userSchema: Schema<IUser> = new mongoose.Schema(
  {
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
        validator: function (value: string) {
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
  },
  { timestamps: true },
);

// sign access token
userSchema.methods.SignAccessToken = function () {
  return jwt.sign({ id: this._id }, process.env.ACCESS_TOKEN || '', {
    expiresIn: '5m',
  });
};

// sign refresh token
userSchema.methods.SignRefreshToken = function () {
  return jwt.sign({ id: this._id }, process.env.REFRESH_TOKEN || '', {
    expiresIn: '3d',
  });
};

// compare password
userSchema.methods.comparePassword = async function (
  enteredPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

const userModel: Model<IUser> = mongoose.model('User', userSchema);

export const getAllUsersModel = async () => {
  return userModel.find();
};

export const getUserByIdModel = async (id: string) => {
  return userModel.findById(id).populate('courses.courseId').exec();
};

export const getUserByEmailModel = async (email: string) => {
  return userModel.findOne({ email }).populate('courses.courseId').exec();
};

export const createUserModel = async (data: any) => {
  return userModel.create(data);
};

export const deleteUserModel = async (id: string) => {
  return userModel.findByIdAndDelete(id);
};

export const updateUserModel = async (id: string, data: any) => {
  return userModel.findByIdAndUpdate(id, data, { new: true });
};

export const deleteAllModel = async () => {
  return userModel.deleteMany({});
};
export default userModel;
