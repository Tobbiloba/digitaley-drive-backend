'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.calculatePaymentAnalytics = exports.calculateUserAnalytics = void 0;
exports.generateLast12MothsData = generateLast12MothsData;
const course_model_1 = require('../models/course.model');
async function generateLast12MothsData(model) {
  const last12Months = [];
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + 1);
  for (let i = 11; i >= 0; i--) {
    const endDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate() - i * 28,
    );
    const startDate = new Date(
      endDate.getFullYear(),
      endDate.getMonth(),
      endDate.getDate() - 28,
    );
    const monthYear = endDate.toLocaleString('default', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    const count = await model.countDocuments({
      createdAt: {
        $gte: startDate,
        $lt: endDate,
      },
    });
    last12Months.push({ month: monthYear, count });
  }
  return { last12Months };
}
const calculateUserAnalytics = (users) => {
  // Calculate total number of users
  const totalUsers = users.length;
  // Calculate total students by gender
  const genderStats = users.reduce(
    (acc, user) => {
      if (user.gender === 'male') {
        acc.male += 1;
      } else if (user.gender === 'female') {
        acc.female += 1;
      }
      return acc;
    },
    { male: 0, female: 0 },
  );
  // Calculate total users by role
  const roleStats = users.reduce(
    (acc, user) => {
      if (user.role === 'user') {
        acc.users += 1;
      } else if (user.role === 'teacher') {
        acc.teachers += 1;
      } else if (user.role === 'admin') {
        acc.admins += 1;
      }
      return acc;
    },
    { users: 0, teachers: 0, admins: 0 },
  );
  return {
    totalUsers,
    genderStats,
    roleStats,
  };
};
exports.calculateUserAnalytics = calculateUserAnalytics;
const calculatePaymentAnalytics = async (payments) => {
  // Fetch all courses
  const courses = await (0, course_model_1.getAllCoursesModel)(); // Assuming this returns a list of course names
  // Total amount of payments (successful transactions)
  const totalPayments = payments.reduce((acc, payment) => {
    if (payment.payment_info.status === 'success') {
      acc += payment.payment_info.price;
    }
    return acc;
  }, 0);
  // Payment stats by month
  const monthlyStats = payments.reduce((acc, payment) => {
    const monthYear = `${payment.createdAt.getMonth() + 1}-${payment.createdAt.getFullYear()}`;
    if (!acc[monthYear]) {
      acc[monthYear] = {
        count: 0,
        totalAmount: 0,
      };
    }
    if (payment.payment_info.status === 'success') {
      acc[monthYear].count += 1;
      acc[monthYear].totalAmount += payment.payment_info.price;
    }
    return acc;
  }, {});
  // Count payments by course
  const courseStats = payments.reduce((acc, payment) => {
    const courseName = payment.payment_info.courseName;
    if (!acc[courseName]) {
      acc[courseName] = {
        count: 0,
        totalAmount: 0,
      };
    }
    if (payment.payment_info.status === 'success') {
      acc[courseName].count += 1;
      acc[courseName].totalAmount += payment.payment_info.price;
    }
    return acc;
  }, {});
  // Ensure all courses are included in the courseStats, even if they have no payments
  courses.forEach((course) => {
    if (!courseStats[course.name]) {
      courseStats[course.name] = {
        count: 0,
        totalAmount: 0,
      };
    }
  });
  return {
    totalPayments,
    monthlyStats,
    courseStats,
  };
};
exports.calculatePaymentAnalytics = calculatePaymentAnalytics;
