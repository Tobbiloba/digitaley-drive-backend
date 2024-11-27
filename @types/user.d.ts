export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  avatar?: string;
  gender: 'Male' | 'Female';
  role: 'admin' | 'user' | 'super admin' | 'teacher';
  isPasswordChanged: boolean;
  authentication: {
    password: string;
    salt: string;
    sessionToken?: string;
  };
  courses: Array<{ courseId: string }>;
  editCourse: Array<{ courseId: string }>;
  SignAccessToken: () => string;
  SignRefreshToken: () => string;
  isPasswordChanged: boolean;
  lastSeen: Date;
  emailSent: boolean;
  balance: number;
  paymentStatus: string;
}
