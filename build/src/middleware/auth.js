"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = exports.hasRefreshToken = exports.isAuthenticated = exports.getToken = void 0;
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const redis_1 = require("../utils/redis");
const catchAsynchError_1 = __importDefault(require("./catchAsynchError"));
const user_controller_1 = require("../controller/user.controller");
const getToken = (token) => {
    if (token.startsWith('Bearer'))
        return token.split(' ')[1];
    return token;
};
exports.getToken = getToken;
// authenticated user
exports.isAuthenticated = (0, catchAsynchError_1.default)(async (req, res, next) => {
    const authHeader = req.headers['authorization'] || req.headers['x-access-token'];
    // console.log(req.headers, authHeader)
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new ErrorHandler_1.default('Please login to access this resource', 401));
    }
    // Extract the token from the header
    const token = authHeader.split(' ')[1]; // Get the token part after "Bearer"
    // Validate and process the token
    const accessToken = (0, exports.getToken)(token);
    // console.log("Token", accessToken); // Debugging purposes
    if (!accessToken) {
        return next(new ErrorHandler_1.default('Invalid token. Please login again.', 401));
    }
    const decoded = jsonwebtoken_1.default.decode(accessToken);
    if (!decoded) {
        return next(new ErrorHandler_1.default('access token is not valid', 400));
    }
    // check if the access token is expired
    if (decoded.exp && decoded.exp <= Date.now() / 1000) {
        try {
            await (0, user_controller_1.updateAccessToken)(req, res, next);
        }
        catch (error) {
            return next(error);
        }
    }
    else {
        const user = await redis_1.redis.get(decoded.id);
        if (!user) {
            return next(new ErrorHandler_1.default('Please login to access this resource', 400));
        }
        req.user = JSON.parse(user);
        // console.log(user)
        next();
    }
});
exports.hasRefreshToken = (0, catchAsynchError_1.default)(async (req, res, next) => {
    if (!req.headers['x-refresh-token']) {
        return next(new ErrorHandler_1.default('Please login to access this resource', 400));
    }
    const refreshToken = (0, exports.getToken)(req.headers['x-refresh-token']);
    if (!refreshToken) {
        return next(new ErrorHandler_1.default('Please login to access this resource', 400));
    }
    const decoded = jsonwebtoken_1.default.decode(refreshToken);
    if (!decoded) {
        return next(new ErrorHandler_1.default('refresh token is not valid', 400));
    }
    // check if the access token is expired
    if (decoded.exp && decoded.exp <= Date.now() / 1000) {
        return next(new ErrorHandler_1.default('refresh token is expired', 400));
    }
    else {
        const user = await redis_1.redis.get(decoded.id);
        if (!user) {
            return next(new ErrorHandler_1.default('Please login to access this resource', 400));
        }
        req.user = JSON.parse(user);
        next();
    }
});
// validate user role
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user?.role || '')) {
            return next(new ErrorHandler_1.default(`Role: ${req.user?.role} is not allowed to access this resource`, 403));
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
