import mongoose, { Document, Schema, Model } from 'mongoose';
import { IPayment } from '../../@types/payment';

const paymentSchema = new Schema<IPayment>(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
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
      custom_fields: { type: Schema.Types.Mixed },
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
  },
  { timestamps: true },
);

const PaymentModel: Model<IPayment> = mongoose.model('Payment', paymentSchema);

export const getAllPaymentsModel = async () => {
  return PaymentModel.find();
};

export const getPaymentByIdModel = async (id: string) => {
  return PaymentModel.findById(id);
};

export const createPaymentModel = async (data: any) => {
  return PaymentModel.create(data);
};

export const getPaymenyByIdModel = async (id: any) => {
  return PaymentModel.findOne(id);
};

export const updatePaymentModel = async (id: string, data: any) => {
  return PaymentModel.findByIdAndUpdate(id, data, {
    new: true,
  });
};

export const deleteAllModel = async () => {
  return PaymentModel.deleteMany({});
};
export default PaymentModel;
