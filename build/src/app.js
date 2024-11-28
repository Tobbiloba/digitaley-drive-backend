'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.app = void 0;
require('dotenv').config();
const express_1 = __importDefault(require('express'));
exports.app = (0, express_1.default)();
const cors_1 = __importDefault(require('cors'));
const cookie_parser_1 = __importDefault(require('cookie-parser'));
const error_1 = require('./middleware/error');
const express_rate_limit_1 = require('express-rate-limit');
const routes_1 = require('./routes');
// body parser
exports.app.use(express_1.default.json({ limit: '50mb' }));
// cookie parser
exports.app.use((0, cookie_parser_1.default)());
// cors => cross origin resource sharing
exports.app.use(
  (0, cors_1.default)({
    origin: JSON.parse(process.env.AUTHORIZED_ORIGIN ?? ''),
    credentials: true,
  }),
);
// api requests limit
const limiter = (0, express_rate_limit_1.rateLimit)({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});
// middleware calls
exports.app.use(limiter);
exports.app
  .use('/api/v1/user', routes_1.userRouter)
  .use('/api/v1/content', routes_1.contentRouter)
  .use('/api/v1/progress', routes_1.progressRouter)
  .use('/api/v1/course', routes_1.courseRouter)
  .use('/api/v1/category', routes_1.categoryRouter)
  .use('/api/v1/assignmentSubmission', routes_1.assignmentSubmissionRouter)
  .use('/api/v1/analytic', routes_1.analyticsRouter)
  .use('/api/v1/payment', routes_1.paymentRouter)
  .use('/api/v1/quizSubmission', routes_1.quizSubmission)
  .use('/api/v1/coupon', routes_1.couponRouter)
  .use('/api/v1/zoho', routes_1.zohoRouter);
// unknown route
exports.app.all('*', (req, res, next) => {
  const err = new Error(`Route ${req.originalUrl} not found`);
  err.statusCode = 404;
  next(err);
});
exports.app.use(error_1.ErrorMiddleware);
