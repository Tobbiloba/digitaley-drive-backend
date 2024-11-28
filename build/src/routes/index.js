'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.zohoRouter =
  exports.quizSubmission =
  exports.assignmentSubmissionRouter =
  exports.userRouter =
  exports.progressRouter =
  exports.paymentRouter =
  exports.courseRouter =
  exports.couponRouter =
  exports.contentRouter =
  exports.categoryRouter =
  exports.analyticsRouter =
    void 0;
var analytics_routes_1 = require('./analytics.routes');
Object.defineProperty(exports, 'analyticsRouter', {
  enumerable: true,
  get: function () {
    return __importDefault(analytics_routes_1).default;
  },
});
var category_routes_1 = require('./category.routes');
Object.defineProperty(exports, 'categoryRouter', {
  enumerable: true,
  get: function () {
    return __importDefault(category_routes_1).default;
  },
});
var content_routes_1 = require('./content.routes');
Object.defineProperty(exports, 'contentRouter', {
  enumerable: true,
  get: function () {
    return __importDefault(content_routes_1).default;
  },
});
var coupon_routes_1 = require('./coupon.routes');
Object.defineProperty(exports, 'couponRouter', {
  enumerable: true,
  get: function () {
    return __importDefault(coupon_routes_1).default;
  },
});
var course_routes_1 = require('./course.routes');
Object.defineProperty(exports, 'courseRouter', {
  enumerable: true,
  get: function () {
    return __importDefault(course_routes_1).default;
  },
});
// export { default as notificationRouter } from "./notification.routes";
// export { default as layoutRouter } from "./layout.routes";
// export { default as mediaRouter } from "./media.routes";
var payment_controller_1 = require('./payment.controller');
Object.defineProperty(exports, 'paymentRouter', {
  enumerable: true,
  get: function () {
    return __importDefault(payment_controller_1).default;
  },
});
// export { default as newUserRouter } from "./new-user.routes";
// export { default as orderRouter } from "./order.routes";
// export { default as paymentRouter } from "./payment.routes";
var progress_routes_1 = require('./progress.routes');
Object.defineProperty(exports, 'progressRouter', {
  enumerable: true,
  get: function () {
    return __importDefault(progress_routes_1).default;
  },
});
// export { default as questionRouter } from "./question.routes";
// export { default as reviewRouter } from "./review.routes";
var user_routes_1 = require('./user.routes');
Object.defineProperty(exports, 'userRouter', {
  enumerable: true,
  get: function () {
    return __importDefault(user_routes_1).default;
  },
});
var assignmentSubmission_routes_1 = require('./assignmentSubmission.routes');
Object.defineProperty(exports, 'assignmentSubmissionRouter', {
  enumerable: true,
  get: function () {
    return __importDefault(assignmentSubmission_routes_1).default;
  },
});
// export { default as verificationRouter } from "./verification.routes";
// export { default as zohoRouter } from "./zoho.routes";
var quizSubmission_routes_1 = require('./quizSubmission.routes');
Object.defineProperty(exports, 'quizSubmission', {
  enumerable: true,
  get: function () {
    return __importDefault(quizSubmission_routes_1).default;
  },
});
var zoho_routes_1 = require('./zoho.routes');
Object.defineProperty(exports, 'zohoRouter', {
  enumerable: true,
  get: function () {
    return __importDefault(zoho_routes_1).default;
  },
});
