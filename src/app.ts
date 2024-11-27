require('dotenv').config();
import express, { NextFunction, Request, Response } from 'express';
export const app = express();
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { ErrorMiddleware } from './middleware/error';
import { rateLimit } from 'express-rate-limit';
import {
  userRouter,
  progressRouter,
  contentRouter,
  courseRouter,
  categoryRouter,
  assignmentSubmissionRouter,
  analyticsRouter,
  paymentRouter,
  quizSubmission,
  couponRouter,
  zohoRouter,
} from './routes';

// body parser
app.use(express.json({ limit: '50mb' }));

// cookie parser
app.use(cookieParser());

// cors => cross origin resource sharing
app.use(
  cors({
    origin: JSON.parse(process.env.AUTHORIZED_ORIGIN ?? ''),
    credentials: true,
  }),
);

// api requests limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

// middleware calls
app.use(limiter);

app
  .use('/api/v1/user', userRouter)
  .use('/api/v1/content', contentRouter)
  .use('/api/v1/progress', progressRouter)
  .use('/api/v1/course', courseRouter)
  .use('/api/v1/category', categoryRouter)
  .use('/api/v1/assignmentSubmission', assignmentSubmissionRouter)
  .use('/api/v1/analytic', analyticsRouter)
  .use('/api/v1/payment', paymentRouter)
  .use('/api/v1/quizSubmission', quizSubmission)
  .use('/api/v1/coupon', couponRouter)
  .use('/api/v1/zoho', zohoRouter);

// unknown route
app.all('*', (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`Route ${req.originalUrl} not found`) as any;
  err.statusCode = 404;
  next(err);
});

app.use(ErrorMiddleware);
