import express from 'express';
import {
  dataSolutionController,
  companyTrainningController,
  brochureController,
  privateClassController,
  hireTalentController,
  contactUsController,
} from '../controller/zoho.controller';

const zohoRouter = express.Router();
zohoRouter.post('/data-solution', dataSolutionController);
zohoRouter.post('/company-trainning', companyTrainningController);
zohoRouter.post('/brochure', brochureController);
zohoRouter.post('/private-class', privateClassController);
zohoRouter.post('/hire-talent', hireTalentController);
zohoRouter.post('/contact-us', contactUsController);

export default zohoRouter;
