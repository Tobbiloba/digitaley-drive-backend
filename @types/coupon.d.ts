export interface ICoupon {
  code: string;
  status: 'active' | 'expired';
  discount: number;
  userId?: mongoose.Types.ObjectId;
}
