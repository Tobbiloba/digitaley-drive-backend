'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== 'default' && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.registerUserFunc =
  exports.registerUserController =
  exports.updateEmailSentStatusController =
  exports.deleteUserController =
  exports.getAllUserController =
  exports.updatePasswordController =
  exports.updateUserInfoController =
  exports.updateAccessToken =
  exports.logoutUserController =
  exports.loginUserController =
    void 0;
require('dotenv').config();
const catchAsynchError_1 = __importDefault(
  require('../middleware/catchAsynchError'),
);
const user_model_1 = __importStar(require('../models/user.model'));
const ErrorHandler_1 = __importDefault(require('../utils/ErrorHandler'));
const auth_1 = require('../utils/auth');
const redis_1 = require('../utils/redis');
const mongoose_1 = __importDefault(require('mongoose'));
const mongodb_1 = require('mongodb');
const jwt_1 = require('../utils/jwt');
const jsonwebtoken_1 = __importDefault(require('jsonwebtoken'));
const course_model_1 = require('../models/course.model');
const payment_model_1 = require('../models/payment.model');
const generate_random_password_1 = require('../utils/generate-random-password');
const content_model_1 = require('../models/content.model');
const progress_model_1 = require('../models/progress.model');
const zoho_controller_1 = require('./zoho.controller');
exports.loginUserController = (0, catchAsynchError_1.default)(
  async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return next(
          new ErrorHandler_1.default('Please enter email and password', 400),
        );
      }
      const user = await user_model_1.default
        .findOne({ email })
        .select('+authentication.password +authentication.salt');
      if (!user) {
        return next(
          new ErrorHandler_1.default('Invalid email or password', 400),
        );
      }
      const { salt, password: hashedPassword } = user?.authentication;
      const expectedHash = (0, auth_1.authentication)(salt, password);
      if (hashedPassword !== expectedHash) {
        return res
          .status(403)
          .json({ message: 'Incorrect password! Please try again' });
      }
      const newSalt = (0, auth_1.random)();
      user.authentication.sessionToken = (0, auth_1.authentication)(
        newSalt,
        user._id?.toString(),
      );
      user.lastSeen = await new Date();
      await user.save();
      (0, jwt_1.sendToken)(user, 200, res);
    } catch (error) {
      return next(new ErrorHandler_1.default(error.message, 400));
    }
  },
);
exports.logoutUserController = (0, catchAsynchError_1.default)(
  async (req, res, next) => {
    try {
      res.cookie('access_token', '', { maxAge: 1 });
      res.cookie('refresh_token', '', { maxAge: 1 });
      const userId = req.user?._id || '';
      redis_1.redis.del(userId);
      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      return next(new ErrorHandler_1.default(error.message, 400));
    }
  },
);
exports.updateAccessToken = (0, catchAsynchError_1.default)(
  async (req, res, next) => {
    try {
      const refresh_token = req.cookies.refresh_token;
      const decoded = jsonwebtoken_1.default.verify(
        refresh_token,
        process.env.REFRESH_TOKEN,
      );
      const message = 'Could not refresh token';
      if (!decoded) {
        return next(new ErrorHandler_1.default(message, 400));
      }
      const session = await redis_1.redis.get(decoded.id);
      if (!session) {
        return next(
          new ErrorHandler_1.default(
            'Please login for access this resources!',
            400,
          ),
        );
      }
      const user = JSON.parse(session);
      const accessToken = jsonwebtoken_1.default.sign(
        { id: user._id },
        process.env.ACCESS_TOKEN,
        {
          expiresIn: '5m',
        },
      );
      const refreshToken = jsonwebtoken_1.default.sign(
        { id: user._id },
        process.env.REFRESH_TOKEN,
        {
          expiresIn: '3d',
        },
      );
      req.user = user;
      res.cookie('access_token', accessToken, jwt_1.accessTokenOptions);
      res.cookie('refresh_token', refreshToken, jwt_1.refreshTokenOptions);
      await redis_1.redis.set(user._id, JSON.stringify(user), 'EX', 604800); // 7days
      return next();
    } catch (error) {
      return next(new ErrorHandler_1.default(error.message, 400));
    }
  },
);
exports.updateUserInfoController = (0, catchAsynchError_1.default)(
  async (req, res, next) => {
    try {
      const updates = req.body;
      const userId = req.user?._id;
      const user = await user_model_1.default.findById(userId);
      if (!user) {
        return next(new ErrorHandler_1.default('User not found', 404));
      }
      // Update user fields dynamically
      Object.keys(updates).forEach((key) => {
        if (key in user) {
          user[key] = updates[key];
        }
      });
      await user.save();
      await redis_1.redis.set(userId, JSON.stringify(user));
      res.status(201).json({
        success: true,
        user,
      });
    } catch (error) {
      return next(new ErrorHandler_1.default(error.message, 400));
    }
  },
);
exports.updatePasswordController = (0, catchAsynchError_1.default)(
  async (req, res, next) => {
    try {
      const { oldPassword, newPassword } = req.body;
      if (!oldPassword || !newPassword) {
        return next(
          new ErrorHandler_1.default(
            'Please enter both old and new passwords',
            400,
          ),
        );
      }
      const user = await user_model_1.default
        .findById(req.user?._id)
        .select('+authentication.password');
      if (!user || !user.authentication.password) {
        return next(
          new ErrorHandler_1.default('User not found or invalid user', 400),
        );
      }
      const { salt, password: hashedPassword } = user.authentication;
      const oldPasswordHash = (0, auth_1.authentication)(salt, oldPassword);
      if (hashedPassword !== oldPasswordHash) {
        return next(new ErrorHandler_1.default('Invalid old password', 400));
      }
      const newSalt = (0, auth_1.random)();
      user.authentication.password = (0, auth_1.authentication)(
        newSalt,
        newPassword,
      );
      user.authentication.salt = newSalt;
      user.isPasswordChanged = true;
      await user.save();
      await redis_1.redis.set(req.user?._id.toString(), JSON.stringify(user));
      res.status(200).json({
        success: true,
        message: 'Password updated successfully',
      });
    } catch (error) {
      return next(new ErrorHandler_1.default(error.message, 400));
    }
  },
);
exports.getAllUserController = (0, catchAsynchError_1.default)(
  async (req, res, next) => {
    try {
      const users = await (0, user_model_1.getAllUsersModel)();
      return res.status(200).json(users);
    } catch (error) {
      return next(new ErrorHandler_1.default(error.message, 400));
    }
  },
);
exports.deleteUserController = (0, catchAsynchError_1.default)(
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const user = await user_model_1.default.findById(id);
      if (!user) {
        return next(new ErrorHandler_1.default('User not found', 404));
      }
      await user.deleteOne({ id });
      await redis_1.redis.del(id);
      res.status(200).json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      return next(new ErrorHandler_1.default(error.message, 400));
    }
  },
);
exports.updateEmailSentStatusController = (0, catchAsynchError_1.default)(
  async (req, res, next) => {
    try {
      const userId = req.user?._id; // Get the user ID from the request
      const user = await user_model_1.default.findById(userId); // Find the user in the database
      if (!user) {
        return next(new ErrorHandler_1.default('User not found', 404)); // Handle user not found error
      }
      if (!user.emailSent) {
        user.emailSent = true; // Update emailSent status to true
        await user.save(); // Save the updated user
      }
      res.status(200).json({
        success: true,
        message: 'Email sent status updated successfully.',
        emailSent: user.emailSent, // Return the updated emailSent status
      });
    } catch (error) {
      return next(new ErrorHandler_1.default(error.message, 400)); // Handle any other errors
    }
  },
);
exports.registerUserController = (0, catchAsynchError_1.default)(
  async (req, res, next) => {
    try {
      const { email, courseName, withInternship, amountPaid, role } = req.body;
      let user;
      user = await user_model_1.default.findOne({ email });
      if ((role === 'teacher' || role === 'user') && !courseName) {
        return next(
          new ErrorHandler_1.default('Please provide a course name', 400),
        );
      }
      if (role === 'user' && !amountPaid) {
        return next(
          new ErrorHandler_1.default('Please provide the amount paid', 400),
        );
      }
      // const course = await getCourseByNameModel(courseName)
      // if (!course) {
      //   return next(new ErrorHandler("Course not found", 404));
      // }
      // If the role is admin, do not check for course existence
      let course;
      if (role !== 'admin' && role !== 'super admin') {
        // Only fetch the course if the role is not admin
        course = await (0, course_model_1.getCourseByNameModel)(courseName);
        if (!course) {
          return next(new ErrorHandler_1.default('Course not found', 404));
        }
      }
      if (role === 'teacher' && course && course.teacherId) {
        return next(
          new ErrorHandler_1.default('Course already has a teacher', 400),
        );
      }
      const courseId = course ? course._id : null;
      if (user && role === 'user') {
        if (course) {
          if (
            user &&
            user.courses.some((course) =>
              new mongodb_1.ObjectId(course.courseId).equals(courseId),
            )
          ) {
            return res.status(400).json({
              success: false,
              message: 'You have already registered for this course',
            });
          }
        }
      }
      const password = (0, generate_random_password_1.generateRandomPassword)();
      const salt = (0, auth_1.random)();
      const hashedPassword = (0, auth_1.authentication)(salt, password);
      console.log({ password });
      if (!user) {
        user = await user_model_1.default.create({
          email,
          courses:
            role === 'admin' || role === 'super admin' ? [] : [{ courseId }],
          role,
          authentication: {
            salt,
            password: hashedPassword,
          },
        });
      } else {
        if (courseId) {
          user.courses.push({ courseId: courseId.toString() });
          await user.save();
        }
      }
      if (role === 'admin' || 'super admin') {
        const data = {
          user: {
            email: email,
          },
          password: password,
          role: role,
        };
        await (0, zoho_controller_1.sendMailWithAccessToken)({
          email: email,
          subject: 'Admin Account Creation',
          template: 'admin-verification.html',
          data,
        });
        return res.status(201).json({
          success: true,
          message: 'User registered successfully',
        });
        return res.status(201).json({
          success: true,
          message: 'Admin registered successfully',
        });
      }
      if (role === 'teacher') {
        if (course) {
          course.teacherId = user._id;
          await course.save(); // Save the course after associating the teacher
        }
        const data = {
          user: { email: email },
          password,
          courseName,
        };
        await (0, zoho_controller_1.sendMailWithAccessToken)({
          email: 'tobiloba.a.salau@gmail.com',
          subject: 'Teacher Account Creation',
          template: 'teacher-activation.html',
          data,
        });
        return res.status(201).json({
          success: true,
          message: 'Teacher registered successfully',
        });
      }
      if (course?.contentId) {
        const contentId = course.contentId;
        const content = await (0, content_model_1.getContentById)(
          contentId.toString(),
        );
        const contentItems = content ? content.contentItems || [] : [];
        const contentIds = contentItems.map((item) => item._id);
        // Create data structure for progress
        const data = {
          contentId: contentId,
          userId: user?._id, // Assuming req.user is set by your authentication middleware
          contentProgress: contentIds.map((id) => {
            return {
              subContentId: id,
              viewed: false,
            };
          }),
          progress: 0,
          completed: false,
        };
        const progress = await (0, progress_model_1.createProgress)(data); // Assuming createProgress takes the data object
      }
      const paymentData = {
        courseId: courseId
          ? new mongoose_1.default.Types.ObjectId(courseId)
          : undefined,
        userId: user._id,
        payment_info: {
          courseName: course ? course.name : 'unknown',
          firstName: 'null',
          lastName: 'null',
          email,
          price: amountPaid,
          phoneNumber: 'null',
          reference_id: ['null'],
          gender: 'null',
          withInternship,
          paymentType: 'full',
          balance: 0,
          fullyPaid: true,
          amountPaid: [
            {
              amount: amountPaid,
              date: new Date().toISOString(),
              status: 'successful',
              reference_id: 'null',
            },
          ],
        },
        status: 'successful',
      };
      const payment = await (0, payment_model_1.createPaymentModel)(
        paymentData,
      );
      //    create user data
      const data = {
        user: { email: email },
        password,
        courseName,
        paymentInfo: paymentData.payment_info,
      };
      await (0, zoho_controller_1.sendMailWithAccessToken)({
        //   email: "rubyihekweme@gmail.com",
        email: 'tobiloba.a.salau@gmail.com',
        subject: 'Account Creation',
        template: 'user-account.html',
        // template: "teacher-activation.html",
        data,
      });
      //              return res.status(201).json({
      //         success: true,
      //         message: 'User registered successfully'
      //       });
      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user,
        payment,
      });
    } catch (error) {
      return next(new ErrorHandler_1.default(error.message, 400)); // Handle errors
    }
  },
);
const registerUserFunc = async ({
  firstName,
  lastName,
  phoneNumber,
  gender,
  email,
  balance,
  courseId,
}) => {
  try {
    // Ensure all necessary parameters are passed
    if (
      !firstName ||
      !lastName ||
      !phoneNumber ||
      !gender ||
      !email ||
      !balance
    ) {
      return 'Missing required parameters.';
    }
    const password = firstName;
    // Hash the password with a salt
    const salt = (0, auth_1.random)();
    const hashedPassword = (0, auth_1.authentication)(salt, password);
    // Fetch the course details
    const course = await (0, course_model_1.getCourseByIdModel)(courseId);
    if (!course) {
      // return res.status(500).json({
      //   message: "Course not found.",
      // });
    }
    // Create user object
    const userData = {
      firstName,
      lastName,
      phoneNumber,
      email,
      role: 'user',
      password: hashedPassword,
      courses: [courseId],
      balance,
      gender,
      authentication: {
        salt, // Ensure `salt` is properly generated
        password: hashedPassword, // Ensure `hashedPassword` is set
      },
    };
    // Save the user to the database
    const user = await (0, user_model_1.createUserModel)(userData);
    console.log('User', user);
    return user;
  } catch (error) {
    return error; // Handle errors
  }
};
exports.registerUserFunc = registerUserFunc;
