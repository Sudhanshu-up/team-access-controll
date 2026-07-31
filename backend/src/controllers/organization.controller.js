import { Organization } from "../models/organization.model.js";
import { Membership } from "../models/membership.model.js";
import ApiError from "../utils/ApiError.js";
import { createOrganizationService } from "../services/organization.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import { getMyOrganizationsService } from "../services/organization.service.js";

export const createOrganization = asyncHandler(async(req,res)=>{

    // 1 validation throw middleware

    // 2 Extract Data
    const {name, description} = req.body;

    //3. create organization throw service

    const organization = await createOrganizationService(
        {
            name,
            description,
            userId:req.user._id,
        }
    );

    // 4. Response
    return res.status(201).json({
        success: true,
        message: "Organization created successfully.",
        data: organization,
    });


})

export const  getMyOrganizations = asyncHandler(async(req, res)=>{

    const oranizations = await getMyOrganizationsService(req.user._id);

    return res.status(200)
    .json(
        {
            success:true,
            data:oranizations,
        }
    );
});
