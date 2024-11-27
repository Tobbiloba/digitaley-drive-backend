import { Request, Response, NextFunction } from 'express';
import CatchAsyncError from '../middleware/catchAsynchError';
import ErrorHandler from '../utils/ErrorHandler';
import { v4 as uuidv4 } from 'uuid';
import { getCourseByIdModel } from '../models/course.model';
import { getUserByEmailModel } from '../models/user.model';
import {
  createPaymentModel,
  getPaymentByIdModel,
  updatePaymentModel,
  getAllPaymentsModel,
  deleteAllModel,
} from '../models/payment.model';
import {
  deleteCouponModel,
  getCouponByCouponCodeModel,
} from '../models/coupon.model';
import { registerUserFunc } from './user.controller';
import PaymentModel from '../models/payment.model';
import axios from 'axios';
export const getAllPayments = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payments = await getAllPaymentsModel();
      return res.status(200).json({
        success: true,
        data: payments,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  },
);

export const initializePayment = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId } = req.params;
      const {
        firstName,
        lastName,
        phoneNumber,
        email,
        reference_id,
        gender,
        custom_fields,
        paymentType,
        withInternship,
        couponCode,
      } = req.body;

      const course = await getCourseByIdModel(courseId);

      if (!course) {
        return next(new ErrorHandler('Course not found', 404));
      }

      const user = await getUserByEmailModel(email);

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
        coupon = await getCouponByCouponCodeModel(couponCode);
        if (coupon) {
          const discountPercent = coupon.discount;
          couponDiscount = (discountPercent / 100) * totalPrice;
          if (discountPercent === 100) {
            amountToBePaid = 0;
          }
          deleteCouponModel(coupon._id);
        }
      }

      if (paymentType === 'full') {
        amountToBePaid = totalPrice;
      }

      const balance = totalPrice - couponDiscount - amountToBePaid;

      const paymentData: any = {
        courseId,
        userId: uuidv4(),
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

      const payment = await createPaymentModel(paymentData);

      return res.status(200).json({ message: 'Payment Initialized', payment });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  },
);

const verifyPaymentStatus = async (referenceId: string): Promise<boolean> => {
  try {
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!paystackSecretKey) {
      throw new Error('Paystack Secret Key not found in environment variables');
    }

    const paystackUrl = `https://api.paystack.co/transaction/verify/${referenceId}`;
    const authorization = `Bearer ${paystackSecretKey}`;
    console.log({ paystackUrl, authorization });
    const response = await axios.get(paystackUrl, {
      headers: {
        Authorization: authorization,
      },
    });

    // Check if the response status is success and payment status is successful
    if (response.data.status && response.data.data.status === 'success') {
      return true;
    } else {
      return false;
    }
  } catch (error: any) {
    console.error('Error verifying payment status:', error.response);
    throw new Error('Payment verification failed');
  }
};

export const updatePaymentInfo = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { paymentId } = req.params;
      const { reference_id, status, amountPaid } = req.body;

      if (!status || !reference_id) {
        return res
          .status(400)
          .json({ message: 'Pass in necessary parameters' });
      }

      const payment = await getPaymentByIdModel(paymentId);
      if (!payment) {
        return res.status(404).json({ message: 'Payment ID invalid' });
      }

      const isPaymentSuccessful = await verifyPaymentStatus(reference_id);

      if (!isPaymentSuccessful) {
        return next(
          new ErrorHandler(
            'Payment verification failed or payment was not successful',
            400,
          ),
        );
      }

      let couponDiscount = 0;
      if (payment.payment_info.coupon.couponCode) {
        const coupon = await getCouponByCouponCodeModel(
          payment.payment_info.coupon.couponCode,
        );
        if (coupon) {
          couponDiscount = (coupon.discount / 100) * payment.payment_info.price;
        }
      }

      const totalAmountPaid =
        payment.payment_info.amountPaid.reduce(
          (sum, payment) => sum + payment.amount,
          0,
        ) + amountPaid;

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

      await updatePaymentModel(paymentId, payment);

      const userExist = await getUserByEmailModel(payment.payment_info.email);

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
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  },
);

export const amountPaidStatus = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { paymentId } = req.params;
      const { reference_id } = req.body;
      console.log('called');
      const payment = await getPaymentByIdModel(paymentId);

      if (!payment) {
        return next(new ErrorHandler('Payment not found', 404));
      }

      if (!reference_id) {
        return res
          .status(400)
          .json({ message: 'Pass in necessary parameters' });
      }

      const isPaymentSuccessful = await verifyPaymentStatus(reference_id);

      if (!isPaymentSuccessful) {
        return next(
          new ErrorHandler(
            'Payment verification failed or payment was not successful',
            400,
          ),
        );
      }

      const paymentEntry = payment.payment_info.amountPaid.find(
        (entry: any) => entry.reference_id === reference_id,
      );

      if (!paymentEntry) {
        return next(
          new ErrorHandler(
            'Payment entry not found with the provided reference ID',
            404,
          ),
        );
      }

      const existingAmount = paymentEntry.amount;
      paymentEntry.date = new Date();

      paymentEntry.status = 'successful'; // Update status to successful

      const totalAmountPaid = payment.payment_info.amountPaid.reduce(
        (acc: number, entry: any) => acc + entry.amount,
        0,
      ); // Total after updating the specific entry

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
          const createAccount = await registerUserFunc({ ...userData });
          console.log('create account', createAccount);
        } catch (error) {
          return res.status(500).json({
            message: 'An error occured',
          });
        }
      }

      await updatePaymentModel(paymentId, payment);

      return res.status(200).json({
        message: 'Payment status updated successfully',
        data: payment,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  },
);

export const makeSecondPayment = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { paymentId } = req.params;
      const { reference_id, amountPaid } = req.body;

      if (!reference_id || !amountPaid) {
        return res
          .status(400)
          .json({ message: 'Pass in necessary parameters' });
      }

      const payment = await getPaymentByIdModel(paymentId);
      if (!payment) {
        return res.status(404).json({ message: 'Payment ID invalid' });
      }

      if (payment.payment_info.fullyPaid) {
        return res
          .status(400)
          .json({ message: 'This payment is already fully settled.' });
      }

      const totalAmountPaid =
        payment.payment_info.amountPaid.reduce(
          (sum, pmt) => sum + pmt.amount,
          0,
        ) + amountPaid;

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

      await updatePaymentModel(paymentId, payment);

      if (fullyPaid) {
        const user = await getUserByEmailModel(payment.payment_info.email);
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
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  },
);

export const deleteAllPaymentsController = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await deleteAllModel();
      res.status(200).json({
        success: true,
        message: 'All payments deleted successfully',
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

export const getPaymentByIdController = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { paymentId } = req.params;
      console.log(paymentId);
      const payment = await getPaymentByIdModel(paymentId);
      return res.status(200).json({
        success: true,
        data: payment,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  },
);

interface UserPaymentInfo {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: number;
  gender: string;
}
interface AddUserPaymentInfo {
  email: string;
  courseId: string;
  amountPaid: number;
  withInternship: boolean;
}
export const addUserPayment = async ({
  email,
  courseId,
  amountPaid,
  withInternship,
}: AddUserPaymentInfo): Promise<void> => {
  try {
    const course = await getCourseByIdModel(courseId);
    // const payment = await PaymentModel.findOne({ "payment_info.email": email });

    // console.log(payment)
    if (!course) {
      throw new Error(`No course record found for courseId: ${courseId}`);
    }

    // // Prepare updated data
    const paymentData: any = {
      courseId,
      userId: uuidv4(),
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

    const paymentCreated = await createPaymentModel(paymentData);

    // // Update the payment record
    console.log(paymentCreated);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(
        `Error updating payment info for email: ${email} - ${error.message}`,
      );
    } else {
      console.error('Unexpected error occurred:', error);
    }
  }
};
export const updateUserPayment = async ({
  email,
  firstName,
  lastName,
  phoneNumber,
  gender,
}: UserPaymentInfo): Promise<void> => {
  try {
    // Find the payment record by email
    const payment = await PaymentModel.findOne({ 'payment_info.email': email });

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
    await updatePaymentModel(paymentId, payment);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(
        `Error updating payment info for email: ${email} - ${error.message}`,
      );
    } else {
      console.error('Unexpected error occurred:', error);
    }
  }
};
