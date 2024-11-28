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
Object.defineProperty(exports, '__esModule', { value: true });
exports.deleteAllCouponModel =
  exports.deleteCouponModel =
  exports.updateCouponStatusModel =
  exports.createCouponModel =
  exports.getCouponByCouponCodeModel =
  exports.getCouponByIdModel =
  exports.getAllCouponModel =
  exports.couponModel =
    void 0;
const mongoose_1 = __importStar(require('mongoose'));
const couponSchema = new mongoose_1.Schema({
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
    type: mongoose_1.default.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
});
exports.couponModel = mongoose_1.default.model('Coupon', couponSchema);
const getAllCouponModel = async () => {
  return exports.couponModel.find();
};
exports.getAllCouponModel = getAllCouponModel;
const getCouponByIdModel = async (couponId) => {
  return exports.couponModel.findById(couponId);
};
exports.getCouponByIdModel = getCouponByIdModel;
const getCouponByCouponCodeModel = async (couponCode) => {
  return exports.couponModel.findOne({
    code: couponCode,
  });
};
exports.getCouponByCouponCodeModel = getCouponByCouponCodeModel;
const createCouponModel = async (data) => {
  return exports.couponModel.create(data);
};
exports.createCouponModel = createCouponModel;
const updateCouponStatusModel = async (code, status) => {
  return exports.couponModel.findOneAndUpdate(
    { code }, // Use the code to find the coupon
    { status },
    { new: true },
  );
};
exports.updateCouponStatusModel = updateCouponStatusModel;
const deleteCouponModel = async (couponId) => {
  return exports.couponModel.findByIdAndDelete(couponId);
};
exports.deleteCouponModel = deleteCouponModel;
const deleteAllCouponModel = async () => {
  return exports.couponModel.deleteMany();
};
exports.deleteAllCouponModel = deleteAllCouponModel;
exports.default = exports.couponModel;
