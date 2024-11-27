import mongoose from 'mongoose';
export interface IPayment {
  courseId: mongoose.Types.ObjectId;
  userId: string;
  payment_info: {
    courseName: string;
    firstName: string;
    lastName: string;
    email: string;
    price: number;
    phoneNumber: number;
    reference_id: [string];
    custom_fields?: any;
    gender: string;
    withInternship: boolean;
    paymentType: 'full' | 'part';
    balance: number;
    coupon: {
      couponCode: string;
      discount: number;
    };
    fullyPaid: boolean;
    accountCreated: true;
    amountPaid: [
      {
        amount: number;
        date: Date;
        status: 'pending' | 'successful' | 'failed';
        reference_id: string;
      },
    ];
    addedByAdmin?: boolean;
  };
  status: string;
}
