import express from "express";
import {body} from "express-validator"
import {createOrgnizationValidator, organizationIdValidator, updateOrganizationValidator} from '../validator/organization.validator.js'
import { validate } from "../middlewares/vaildate.middleware.js";
import { authUser } from "../middlewares/authuser.middleare.js";
import { createOrganization,getMyOrganizations,getOrganizationById,updateOrganization,deleteOrganization} from "../controllers/organization.controller.js";
const router = express.Router();

// Create Organization
router.post("/",authUser,createOrgnizationValidator,validate,createOrganization);

// get my all Organization

router.get('/organizations',authUser, getMyOrganizations);

// Get Single Organization
router.get("/organization/:org_id",authUser, organizationIdValidator,validate,getOrganizationById);

// Update Organization
router.patch("/updateorganization/:org_id",authUser,updateOrganizationValidator,validate,updateOrganization); 


// Soft Delete Organization
router.delete("/deleteorganization/:org_id",authUser,organizationIdValidator,validate,deleteOrganization);




export default router;
