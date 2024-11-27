"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const zoho_controller_1 = require("../controller/zoho.controller");
const zohoRouter = express_1.default.Router();
zohoRouter.post('/data-solution', zoho_controller_1.dataSolutionController);
zohoRouter.post('/company-trainning', zoho_controller_1.companyTrainningController);
zohoRouter.post('/brochure', zoho_controller_1.brochureController);
zohoRouter.post('/private-class', zoho_controller_1.privateClassController);
zohoRouter.post('/hire-talent', zoho_controller_1.hireTalentController);
zohoRouter.post('/contact-us', zoho_controller_1.contactUsController);
exports.default = zohoRouter;
