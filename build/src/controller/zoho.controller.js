"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMailWithAccessToken = exports.companyTrainningController = exports.brochureController = exports.privateClassController = exports.hireTalentController = exports.contactUsController = exports.dataSolutionController = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const ejs_1 = __importDefault(require("ejs"));
const path_1 = __importDefault(require("path"));
const catchAsynchError_1 = __importDefault(require("../middleware/catchAsynchError"));
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const superagent = require('superagent');
const refreshAccessToken = async () => {
    try {
        const response = await superagent
            .post('https://accounts.zoho.eu/oauth/v2/token') // Ensure region matches your Zoho account
            .type('form')
            .send({
            refresh_token: process.env.ZOHO_REFRESH_TOKEN,
            client_id: process.env.ZOHO_CLIENT_ID,
            client_secret: process.env.ZOHO_CLIENT_SECRET,
            grant_type: 'refresh_token',
        });
        const newAccessToken = response.body.access_token;
        return newAccessToken;
    }
    catch (error) {
        throw new Error('Failed to refresh access token.');
    }
};
// Function to send data to Zoho spreadsheet
const sendDataToZohoSpreadsheet = async (data, spreadsheetId) => {
    try {
        // const accessToken = getAccessToken();
        const accessToken = process.env.ZOHO_ACCESS_TOKEN;
        const res = await superagent
            .post(`${process.env.ZOHO_SHEET_URL}${spreadsheetId}`)
            .set('Authorization', `Zoho-oauthtoken ${accessToken}`)
            .type('form')
            .send({
            method: 'worksheet.records.add',
            worksheet_name: 'Sheet1',
            header_row: '1',
            json_data: JSON.stringify([data]),
        });
        return res.status;
    }
    catch (error) {
        // Handle token expiration error
        if (error.response && error.response.status === 401) {
            const newAccessToken = await refreshAccessToken();
            return await superagent
                .post(`${process.env.ZOHO_SHEET_URL}${process.env.ZOHO_DATA_SOLUTION_SPREADSHEET_ID}`)
                .set('Authorization', `Zoho-oauthtoken ${newAccessToken}`)
                .type('form')
                .send({
                method: 'worksheet.records.add',
                worksheet_name: 'Sheet1',
                header_row: '1',
                json_data: JSON.stringify([data]),
            });
        }
        throw error;
    }
};
// Main controller function
exports.dataSolutionController = (0, catchAsynchError_1.default)(async (req, res, next) => {
    const { email, firstName, lastName, message, additionalMessage } = req.body;
    const data = {
        Email: email,
        'First Name': firstName,
        'Last Name': lastName,
        Message: message,
        'Kindly Provide any additional detail': additionalMessage,
    };
    try {
        const spreadsheetId = process.env.ZOHO_DATA_SOLUTION_SPREADSHEET_ID;
        const response = await sendDataToZohoSpreadsheet(data, spreadsheetId);
        return res.status(200).json({
            success: true,
            message: 'Successfully sent data',
            status: response.status,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default('Failed to send data to Zoho Spreadsheet. Please try again later.', 400));
    }
});
exports.contactUsController = (0, catchAsynchError_1.default)(async (req, res, next) => {
    const { email, firstName, lastName, message, phone } = req.body;
    const data = {
        Email: email,
        'First Name': firstName,
        'Last Name': lastName,
        'Message Enquiry': message,
        Phone: phone,
    };
    try {
        const spreadsheetId = process.env.ZOHO_CONTACT_US_SPREADSHEET_ID;
        const response = await sendDataToZohoSpreadsheet(data, spreadsheetId);
        return res.status(200).json({
            success: true,
            message: 'Successfully sent data',
            status: response.status,
        });
    }
    catch (error) {
        console.log({ error });
        return next(new ErrorHandler_1.default(error, 400));
    }
});
exports.hireTalentController = (0, catchAsynchError_1.default)(async (req, res, next) => {
    const { jobTitle, jobDescription, jobType, hiringMultiple, additionalNote, email, name, } = req.body;
    const data = {
        'Job Title': jobTitle,
        'Job Description': jobDescription,
        'Job Type': jobType,
        'Hiring Multiple Candidates': hiringMultiple,
        'Additional Note': additionalNote,
        'Contact Person': name,
        'Contact Email': email,
    };
    try {
        const spreadsheetId = process.env.ZOHO_HIRE_TALENT_SPREADSHEET_ID;
        const response = await sendDataToZohoSpreadsheet(data, spreadsheetId);
        return res.status(200).json({
            success: true,
            message: 'Successfully sent data',
            status: response.status,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default('Failed to send data to Zoho Spreadsheet. Please try again later.', 400));
    }
});
exports.privateClassController = (0, catchAsynchError_1.default)(async (req, res, next) => {
    const { firstName, currentRole, lastName, email, phoneNumber, companyName, course, hearAboutUs, other, gender, } = req.body;
    const data = {
        'First Name': firstName,
        'Last Name': lastName,
        Email: email,
        'Phone Number': phoneNumber,
        'Company Name': companyName,
        Course: course,
        Other: other,
        Gender: gender,
        'How did you hear about us?': hearAboutUs,
        companyRole: currentRole,
    };
    try {
        const spreadsheetId = process.env.ZOHO_PRIVATE_CLASS_SPREADSHEET_ID;
        const response = await sendDataToZohoSpreadsheet(data, spreadsheetId);
        return res.status(200).json({
            success: true,
            message: 'Successfully sent data',
            status: response.status,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default('Failed to send data to Zoho Spreadsheet. Please try again later.', 400));
    }
});
exports.brochureController = (0, catchAsynchError_1.default)(async (req, res, next) => {
    const { email, course } = req.body;
    const data = {
        Email: email,
        Course: course,
    };
    try {
        const spreadsheetId = process.env.ZOHO_BROCHURE_SPREADSHEET_ID;
        const response = await sendDataToZohoSpreadsheet(data, spreadsheetId);
        return res.status(200).json({
            success: true,
            message: 'Successfully sent data',
            status: response.status,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default('Failed to send data to Zoho Spreadsheet. Please try again later.', 400));
    }
});
exports.companyTrainningController = (0, catchAsynchError_1.default)(async (req, res, next) => {
    const { email, course, firstName, lastName, companyName, phoneNumber, jobTitle, noOfEmployees, companyWebsite, otherComment, hearAboutUs, } = req.body;
    const data = {
        Email: email,
        Course: course,
        'First Name': firstName,
        'Last Name': lastName,
        'Phone Number': phoneNumber,
        'Job Title': jobTitle,
        'Number of Employees': noOfEmployees,
        "Company's Website": companyWebsite,
        'Other comments': otherComment,
        'How did you hear about us?': hearAboutUs,
        'Company Name': companyName,
    };
    try {
        const spreadsheetId = process.env.ZOHO_BUSINESS_SPREADSHEET_ID;
        const response = await sendDataToZohoSpreadsheet(data, spreadsheetId);
        return res.status(200).json({
            success: true,
            message: 'Successfully sent data',
            status: response.status,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default('Failed to send data to Zoho Spreadsheet. Please try again later.', 400));
    }
});
const sendMailWithAccessToken = async (options) => {
    try {
        await refreshAccessToken();
        let transporter = nodemailer_1.default.createTransport({
            host: 'smtp.zoho.eu',
            port: 465,
            secure: true,
            auth: {
                user: 'contact@digitaleydrive.com',
                pass: 'GwsRVMqt4g1H',
            },
        });
        const { email, subject, template, data } = options;
        // Path to the email template file
        const templatePath = path_1.default.join(__dirname, '../template', template);
        // Render the email template with EJS
        const html = await ejs_1.default.renderFile(templatePath, data);
        const mailOptions = {
            from: 'contact@digitaleydrive.com',
            to: email,
            subject,
            html,
        };
        await transporter.sendMail(mailOptions);
    }
    catch (error) {
        throw new Error('Failed to send email.');
    }
};
exports.sendMailWithAccessToken = sendMailWithAccessToken;
