import express from "express";
import {body} from "express-validator"
import {createOrgnizationValidator, organizationIdValidator, updateOrganizationValidator} from '../validator/organization.validator.js'
import { validate } from "../middlewares/vaildate.middleware.js";
import { authUser } from "../middlewares/authuser.middleare.js";
import { createOrganization,getMyOrganizations } from "../controllers/organization.controller.js";
const router = express.Router();

// Create Organization
router.post("/",authUser,createOrgnizationValidator,validate,createOrganization);

// get my all Organization

router.get('/organizations',authUser, getMyOrganizations);





export default router;