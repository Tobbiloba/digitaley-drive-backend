import mongoose, { Document, Model, Schema } from 'mongoose';
import { ICoupon } from '../../@types/coupon';

const couponSchema = new Schema<ICoupon>({
  code: {
    type: String,
    required: [true, 'Coupon Code is required'],
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'expired'],
  },
  discount: {
    type: Number,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
});

export const couponModel: Model<ICoupon> = mongoose.model(
  'Coupon',
  couponSchema,
);

export const getAllCouponModel = async () => {
  return couponModel.find();
};

export const getCouponByIdModel = async (couponId: string) => {
  return couponModel.findById(couponId);
};

export const getCouponByCouponCodeModel = async (couponCode: string) => {
  return couponModel.findOne({
    code: couponCode,
  });
};

export const createCouponModel = async (data: ICoupon) => {
  return couponModel.create(data);
};

export const updateCouponStatusModel = async (code: string, status: string) => {
  return couponModel.findOneAndUpdate(
    { code }, // Use the code to find the coupon
    { status },
    { new: true },
  );
};

export const deleteCouponModel = async (couponId: any) => {
  return couponModel.findByIdAndDelete(couponId);
};

export const deleteAllCouponModel = async () => {
  return couponModel.deleteMany();
};
export default couponModel;
