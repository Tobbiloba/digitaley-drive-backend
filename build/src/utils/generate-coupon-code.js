"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCouponCode = void 0;
const generateCouponCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let coupon = '';
    for (let i = 0; i < 8; i++) {
        coupon += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return coupon;
};
exports.generateCouponCode = generateCouponCode;
