import axios from 'axios';
import { URLSearchParams } from 'url';
import { Request, Response, NextFunction } from 'express';
import CatchAsyncError from '../middleware/catchAsynchError';
import ErrorHandler from '../utils/ErrorHandler';

export const dataSolutionController = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, firstName, lastName, phone, message, additionalMessage } =
      req.body;

    const data = {
      Email: email,
      'First Name': firstName,
      'Last Name': lastName,
      Phone: phone,
      Message: message,
      'Kindly provide any additional information': additionalMessage,
    };

    try {
      const response = await sendDataToZohoSpreadsheet(data);
      return res.status(200).json({
        success: true,
        message: 'Successfully sent data',
        status: response.status,
      });
    } catch (error: any) {
      console.error('Error sending data to Zoho Spreadsheet:', error.message);

      if (error.response?.status === 401) {
        console.log('Access token expired. Attempting to refresh...');
        try {
          console.log('refreshing token');
          await refreshAccessToken();
          const retryResponse = await sendDataToZohoSpreadsheet(data); // Retry after refreshing the token
          return res.status(200).json({
            success: true,
            message: 'Successfully sent data after token refresh',
            status: retryResponse.status,
          });
        } catch (refreshError: any) {
          console.error(
            'Failed to refresh access token:',
            refreshError.message,
          );
          return next(
            new ErrorHandler(
              'Failed to refresh access token. Please try again later.',
              401,
            ),
          );
        }
      }

      return next(
        new ErrorHandler(
          'Failed to send data to Zoho Spreadsheet. Please try again later.',
          400,
        ),
      );
    }
  },
);

// Utility function to handle the Zoho API request
const sendDataToZohoSpreadsheet = async (data: object) => {
  console.log({ data });
  console.log(
    `${process.env.ZOHO_SHEET_URL}${process.env.ZOHO_DATA_SOLUTION_SPREADSHEET_ID}`,
  );
  return await superagent
    .post(
      `${process.env.ZOHO_SHEET_URL}/${process.env.ZOHO_DATA_SOLUTION_SPREADSHEET_ID}`,
    )
    .set('Authorization', `Zoho-oauthtoken ${process.env.ZOHO_ACCESS_TOKEN}`)
    .type('form') // Ensure the request is sent as form data
    .send({
      method: 'worksheet.records.add',
      worksheet_name: 'Sheet1', // Target worksheet
      header_row: '1', // Specifies that the first row contains headers
      json_data: JSON.stringify(data), // Convert data to JSON string
    });
};

export const zohoBusiness = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, firstName, lastName, phone, message, additionalMessage } =
        req.body;
      const data = {
        Email: email,
        'First Name': firstName,
        'Last Name': lastName,
        Phone: phone,
        Message: message,
        'Kindly provide any additional information': additionalMessage,
      };
      const response = await superagent
        .post(`${process.env.ZOHO_BUSINESS_SPREADSHEET_ID}`)
        .set('Authorization', `Zoho-oauthtoken ${ZOHO_ACCESS_TOKEN}`)
        .type('form') // Ensure the request is sent as form data
        .send({
          method: 'worksheet.records.add',
          worksheet_name: 'Sheet1', // Target worksheet
          header_row: '1', // Specifies that the first row contains headers
          json_data: JSON.stringify(data), // Convert data to JSON string
        });
      // return res.status(200).json({
      //     success: true,
      //     message: response.data,
      // });
    } catch (error: any) {
      console.log('Error', error.response.data);
      return next(new ErrorHandler(error.message, 400));
    }
  },
);

async function refreshAccessToken() {
  try {
    const response = await superagent
      .post('https://accounts.zoho.eu/oauth/v2/token')
      .type('form')
      .send({
        refresh_token: process.env.ZOHO_REFRESH_TOKEN,
        client_id: process.env.ZOHO_CLIENT_ID,
        client_secret: process.env.ZOHO_CLIENT_SECRET,
        grant_type: 'refresh_token',
      });

    process.env.ZOHO_ACCESS_TOKEN = response.body.access_token;
    console.log(response.body.access_token);
    console.log('Access token refreshed:', process.env.ZOHO_ACCESS_TOKEN);
  } catch (error: any) {
    console.error(
      'Error refreshing access token:',
      error.response?.body || error.message,
    );
    throw error;
  }
}

const superagent = require('superagent');
// "access_token": "",
//     "refresh_token": "1000.5c55fb676137ebb723f70270d384732c.21c50c211063d0fc1f7232969839f53d",
// const ZOHO_REFRESH_TOKEN = '1000.5c55fb676137ebb723f70270d384732c.21c50c211063d0fc1f7232969839f53d'; // Replace with your refresh token
// const ZOHO_CLIENT_ID = '1000.TDW3JAV2BWTMP17LTGJI5J5TILLKPG'; // Replace with your client ID
// const ZOHO_CLIENT_SECRET = '90e548c249c83190839d3a6eda6aaa8202151ca922'; // Replace with your client secret
// let ZOHO_ACCESS_TOKEN = '1000.00733577318d47e854b94eb4ec83247d.0d2c1b429937908d0415a477a2f8f2b8'; // Replace with your access token

const ZOHO_REFRESH_TOKEN =
  '1000.4ca7e0621511e12adbff267a57c6bb3f.4938a8f3f860bc9c44967a04aa939d5b'; // Replace with your refresh token
const ZOHO_CLIENT_ID = '1000.J3IU7V0A60XW1D0GSKH54B7WNFNWIL'; // Replace with your client ID
const ZOHO_CLIENT_SECRET = '3cfc150569805f513b2bd9b8d80b2b544f82dc5c1f'; // Replace with your client secret
let ZOHO_ACCESS_TOKEN =
  '1000.b323e2333f1a27a18fe6f2ca564c0d16.d3bd8ec4b40d3c9b00547cad5c9f27d5'; // Replace with your access token
const SPREADSHEET_ID = 'h2yhydcbd2da4134b436298d4903202611bb9'; // Replace with your spreadsheet ID
// const SPREADSHEET_ID = 'u1wsn823d93007a8e4996b2799e03ebf6866b'; // Replace with your spreadsheet ID

// Function to refresh Zoho access token
// async function refreshAccessToken() {
//     try {
//       const response = await superagent
//         .post('https://accounts.zoho.eu/oauth/v2/token')
//         .type('form')
//         .send({
//           refresh_token: process.env.ZOHO_REFRESH_TOKEN,
//           client_id: process.env.ZOHO_CLIENT_ID,
//           client_secret: process.env.ZOHO_CLIENT_SECRET,
//           grant_type: 'refresh_token',
//         });

//         process.env.ZOHO_ACCESS_TOKEN = response.body.access_token;
//       console.log(response.body.access_token)
//       console.log('Access token refreshed:', process.env.ZOHO_ACCESS_TOKEN);
//     } catch (error: any) {
//       console.error('Error refreshing access token:', error.response?.body || error.message);
//       throw error;
//     }
//   }

// Function to send data to Zoho Spreadsheet
//   export async function sendDataToZohoSpreadsheet(data: any) {
//     const endpoint = `https://sheet.zoho.eu/api/v2/${SPREADSHEET_ID}`;

//     try {
//       const response = await superagent
//         .post(endpoint)
//         .set('Authorization', `Zoho-oauthtoken ${ZOHO_ACCESS_TOKEN}`)
//         .type('form') // Ensure the request is sent as form data
//         .send({
//           method: 'worksheet.records.add',
//           worksheet_name: 'Sheet1', // Target worksheet
//           header_row: '1', // Specifies that the first row contains headers
//           json_data: JSON.stringify(data), // Convert data to JSON string
//         });

//       console.log('Data sent successfully:', response.body);
//     } catch (error: any) {
//       if (error.response && error.response.status === 401) {
//         console.log('Access token expired. Refreshing...');
//         await refreshAccessToken();
//         return sendDataToZohoSpreadsheet(data); // Retry after refreshing the token
//       }
//       console.error('Error sending data to Zoho Spreadsheet:', error.response?.body || error.message);
//       throw error;
//     }
//   }

//   // Example usage
//   (async () => {
//     const exampleData = [
//       {
//         "First Name": 'John',
//         "Last Name": 'Doe'
//       }
//     ];

//     try {
//       await sendDataToZohoSpreadsheet(exampleData);
//     } catch (error: any) {
//       console.error('Failed to send data:', error.message);
//     }
//   })();

import nodemailer from 'nodemailer';
import ejs from 'ejs';
import path from 'path';

// interface EmailDetails {
//     toEmail: string;
//     subject: string;
//     message: string;
// }

// export const sendZohoMail = async (emailDetails: EmailDetails): Promise<{ success: boolean; data?: any; error?: string }> => {
//     try {
//         const { toEmail, subject, message } = emailDetails;

//         // Ensure all required fields are provided
//         if (!toEmail || !subject || !message) {
//             throw new Error("Missing required fields: toEmail, subject, or message.");
//         }

//         // Set up the request body for Zoho Mail API
//         const emailData = {
//             from: "tobiloba.a.salau@gmail.com", // Your Zoho email
//             to: toEmail,
//             subject: subject,
//             text: message
//         };

//         // Zoho Mail API URL for sending mail
//         const url = "https://mail.zoho.com/api/accounts/{account_id}/messages";

//         // Replace {account_id} with your Zoho account ID
//         const accountId = "854405884";

//         // Make the API call to send the email
//         const response = await axios.post(
//             url.replace("{account_id}", accountId),
//             emailData,
//             {
//                 headers: {
//                     Authorization: `Zoho-oauthtoken ${ZOHO_ACCESS_TOKEN}`, // Replace with your actual OAuth token
//                     "Content-Type": "application/json",
//                 },
//             }
//         );
//         console.log({response})
//         console.log("success")

//         // Return success response
//         return {
//             success: true,
//             data: response.data,
//         };
//     } catch (error: any) {
//         if (error.response && error.response.status === 401) {
//             console.log('Access token expired. Refreshing...');
//             await refreshAccessToken();
//             await sendZohoMail({
//                 // from: 'tobiloba.a.salau@gmail.com', // Your Zoho Mail email address
//                 toEmail: 'abayomitobiloba410@gmail.com', // Recipient email address
//                 subject: 'Test Email',
//                 message: 'This is a test email sent via Zoho Mail API using Node.js!',
//               });
//           }
//         // Return error response
//         console.log(error? error.response?.data : error.message)
//         return {
//             success: false,
//             error: error.response?.data || error.message,
//         };
//     }
// };

//   (async () => {
//     try {
//       await sendZohoMail({
//         // from: 'tobiloba.a.salau@gmail.com', // Your Zoho Mail email address
//         toEmail: 'abayomitobiloba410@gmail.com', // Recipient email address
//         subject: 'Test Email',
//         message: 'This is a test email sent via Zoho Mail API using Node.js!',
//       });
//     } catch (error: any) {
//       console.error('Error:', error.message);
//     }
//   })();

export const sendMailWithAccessToken = async (options: any): Promise<void> => {
  try {
    await refreshAccessToken();
    let transporter = nodemailer.createTransport({
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
    const templatePath = path.join(__dirname, '../template', template);

    // Render the email template with EJS
    const html: string = await ejs.renderFile(templatePath, data);

    const mailOptions = {
      from: 'contact@digitaleydrive.com',
      to: email,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log('sent successful');
    console.log(`Email sent successfully to ${email}`);
  } catch (error: any) {
    if (error.response && error.response.status === 401) {
      console.log('Access token expired. Refreshing...');
      await refreshAccessToken();
      await sendMailWithAccessToken({
        email: 'abayomitobiloba410@gmail.com',
        subject: 'Welcome to Our Platform',
        template: 'email-validation.html',
        data: { name: 'John Doe', appName: 'Awesome App' },
      }); // Retry after refreshing the token
    }
    console.error(`Error sending email: ${error.message}`);
    throw new Error('Failed to send email.');
  }
};

(async () => {
  try {
    await sendMailWithAccessToken({
      email: 'tobiloba.a.salau@gmail.com',
      subject: 'Welcome to Our Platform',
      template: 'email-validation.html',
      data: { name: 'John Doe', appName: 'Awesome App' },
    });
    console.log('Email sent successfully!');
  } catch (error: any) {
    console.error(error.message);
  }
})();
