require('dotenv').config();
import { Request, Response, NextFunction } from 'express';
import CatchAsyncError from '../middleware/catchAsynchError';
import userModel, {
  createUserModel,
  getAllUsersModel,
} from '../models/user.model';
import ErrorHandler from '../utils/ErrorHandler';
import { random, authentication } from '../utils/auth';
import { redis } from '../utils/redis';
import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';
import {
  sendToken,
  accessTokenOptions,
  refreshTokenOptions,
} from '../utils/jwt';
import jwt, { JwtPayload } from 'jsonwebtoken';
import {
  getCourseByIdModel,
  getCourseByNameModel,
} from '../models/course.model';
import { createPaymentModel } from '../models/payment.model';
import { generateRandomPassword } from '../utils/generate-random-password';
import { getContentById } from '../models/content.model';
import { createProgress } from '../models/progress.model';
import { sendMailWithAccessToken } from './zoho.controller';

interface ILoginRequest {
  email: string;
  password: string;
}

export const loginUserController = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body as ILoginRequest;
      if (!email || !password) {
        return next(new ErrorHandler('Please enter email and password', 400));
      }

      const user = await userModel
        .findOne({ email })
        .select('+authentication.password +authentication.salt +firstName');
      if (!user) {
        return next(new ErrorHandler('Invalid email or password', 400));
      }

      const { salt, password: hashedPassword } = user?.authentication;
      const expectedHash = authentication(salt, password);
      console.log(expectedHash, hashedPassword);
      if (hashedPassword !== expectedHash) {
        return res
          .status(403)
          .json({ message: 'Incorrect password! Please try again' });
      }

      const newSalt = random();
      user.authentication.sessionToken = authentication(
        newSalt,
        user._id?.toString(),
      );
      user.lastSeen = await new Date();
      await user.save();
      sendToken(user, 200, res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  },
);

export const logoutUserController = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.cookie('access_token', '', { maxAge: 1 });
      res.cookie('refresh_token', '', { maxAge: 1 });
      const userId = req.user?._id || '';
      redis.del(userId);
      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  },
);

export const updateAccessToken = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refresh_token = req.cookies.refresh_token as string;
      const decoded = jwt.verify(
        refresh_token,
        process.env.REFRESH_TOKEN as string,
      ) as JwtPayload;

      const message = 'Could not refresh token';
      if (!decoded) {
        return next(new ErrorHandler(message, 400));
      }
      const session = await redis.get(decoded.id as string);

      if (!session) {
        return next(
          new ErrorHandler('Please login for access this resources!', 400),
        );
      }

      const user = JSON.parse(session);

      const accessToken = jwt.sign(
        { id: user._id },
        process.env.ACCESS_TOKEN as string,
        {
          expiresIn: '5m',
        },
      );

      const refreshToken = jwt.sign(
        { id: user._id },
        process.env.REFRESH_TOKEN as string,
        {
          expiresIn: '3d',
        },
      );

      req.user = user;

      res.cookie('access_token', accessToken, accessTokenOptions);
      res.cookie('refresh_token', refreshToken, refreshTokenOptions);

      await redis.set(user._id, JSON.stringify(user), 'EX', 604800); // 7days

      return next();
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  },
);

interface IUpdateUserInfo {
  [key: string]: any;
}

export const updateUserInfoController = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updates = req.body;

      const userId = req.user?._id;
      const user = await userModel.findById(userId);
      if (!user) {
        return next(new ErrorHandler('User not found', 404));
      }

      // Update user fields dynamically
      Object.keys(updates).forEach((key) => {
        if (key in user) {
          (user as any)[key] = updates[key as keyof IUpdateUserInfo];
        }
      });

      await user.save();
      await redis.set(userId, JSON.stringify(user));

      res.status(201).json({
        success: true,
        user,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  },
);

interface IUpdatePassword {
  oldPassword: string;
  newPassword: string;
}

export const updatePasswordController = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { oldPassword, newPassword } = req.body as IUpdatePassword;
      if (!oldPassword || !newPassword) {
        return next(
          new ErrorHandler('Please enter both old and new passwords', 400),
        );
      }

      const user = await userModel
        .findById(req.user?._id)
        .select('+authentication.password');

      if (!user || !user.authentication.password) {
        return next(new ErrorHandler('User not found or invalid user', 400));
      }

      const { salt, password: hashedPassword } = user.authentication;
      const oldPasswordHash = authentication(salt, oldPassword);
      console.log(oldPasswordHash, hashedPassword);
      if (hashedPassword !== oldPasswordHash) {
        return next(new ErrorHandler('Invalid old password', 400));
      }

      const newSalt = random();
      user.authentication.password = authentication(newSalt, newPassword);
      user.authentication.salt = newSalt;
      user.isPasswordChanged = true;
      await user.save();
      await redis.set(req.user?._id.toString(), JSON.stringify(user));

      res.status(200).json({
        success: true,
        message: 'Password updated successfully',
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  },
);

export const getAllUserController = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await getAllUsersModel();
      return res.status(200).json(users);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  },
);

export const deleteUserController = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const user = await userModel.findById(id);

      if (!user) {
        return next(new ErrorHandler('User not found', 404));
      }

      await user.deleteOne({ id });
      await redis.del(id);

      res.status(200).json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  },
);

export const updateEmailSentStatusController = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id; // Get the user ID from the request
      const user = await userModel.findById(userId); // Find the user in the database

      if (!user) {
        return next(new ErrorHandler('User not found', 404)); // Handle user not found error
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
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400)); // Handle any other errors
    }
  },
);

export const registerUserController = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, courseName, withInternship, amountPaid, role } = req.body;
      let user;
      user = await userModel.findOne({ email });

      if ((role === 'teacher' || role === 'user') && !courseName) {
        return next(new ErrorHandler('Please provide a course name', 400));
      }
      if (role === 'user' && !amountPaid) {
        return next(new ErrorHandler('Please provide the amount paid', 400));
      }

      // const course = await getCourseByNameModel(courseName)
      // if (!course) {
      //   return next(new ErrorHandler("Course not found", 404));
      // }
      // If the role is admin, do not check for course existence
      let course;
      if (role !== 'admin' && role !== 'super admin') {
        // Only fetch the course if the role is not admin
        course = await getCourseByNameModel(courseName);
        if (!course) {
          return next(new ErrorHandler('Course not found', 404));
        }
      }

      if (role === 'teacher' && course && course.teacherId) {
        return next(new ErrorHandler('Course already has a teacher', 400));
      }

      const courseId = course ? course._id : null;
      if (user && role === 'user') {
        if (course) {
          if (
            user &&
            user.courses.some((course) =>
              new ObjectId(course.courseId).equals(courseId),
            )
          ) {
            return res.status(400).json({
              success: false,
              message: 'You have already registered for this course',
            });
          }
        }
      }
      const password = generateRandomPassword();
      const salt = random();
      const hashedPassword = authentication(salt, password);
      console.log({ password });

      if (!user) {
        user = await userModel.create({
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

        await sendMailWithAccessToken({
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

        await sendMailWithAccessToken({
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
        const content = await getContentById(contentId.toString());
        const contentItems = content ? content.contentItems || [] : [];
        const contentIds = contentItems.map((item: any) => item._id);

        // Create data structure for progress
        const data = {
          contentId: contentId,
          userId: user?._id, // Assuming req.user is set by your authentication middleware
          contentProgress: contentIds.map((id: any) => {
            return {
              subContentId: id,
              viewed: false,
            };
          }),
          progress: 0,
          completed: false,
        };

        const progress = await createProgress(data); // Assuming createProgress takes the data object
      }

      const paymentData = {
        courseId: courseId ? new mongoose.Types.ObjectId(courseId) : undefined,
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

      const payment = await createPaymentModel(paymentData);

      //    create user data

      const data = {
        user: { email: email },
        password,
        courseName,
        paymentInfo: paymentData.payment_info,
      };

      await sendMailWithAccessToken({
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
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400)); // Handle errors
    }
  },
);

export const registerUserFunc = async ({
  firstName,
  lastName,
  phoneNumber,
  gender,
  email,
  balance,
  courseId,
}: any) => {
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
    const salt = random();
    const hashedPassword = authentication(salt, password);

    // Fetch the course details
    const course = await getCourseByIdModel(courseId);
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
    const user = await createUserModel(userData);
    console.log('User', user);

    return user;
  } catch (error: any) {
    return error; // Handle errors
  }
};
