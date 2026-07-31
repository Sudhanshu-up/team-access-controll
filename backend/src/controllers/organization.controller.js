import { Organization } from "../models/organization.model.js";
import { Membership } from "../models/membership.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { createOrganizationService ,getMyOrganizationsService,getMyOrganizationsByIdService,updateOrganizationService,deleteOrganizationService } from "../services/organization.service.js";

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

    const organizations = await getMyOrganizationsService(req.user._id);

    return res.status(200)
    .json(
        {
            success:true,
            data:organizations,
        }
    );
});

export const getOrganizationById = asyncHandler(async(req,res)=>{

    console.log('userid :',req.user._id,"org_ID:",req.params.org_id);

    const organizationById = await getMyOrganizationsByIdService(req.user._id,req.params.org_id);

    return res.status(200)
    .json(
        {
            success:true,
            data:organizationById
        }
    )
});

export const updateOrganization = asyncHandler(async(req, res)=>{

    const organizationUpdate = await updateOrganizationService(
        req.user._id,
        req.params.org_id,
        req.body
    );

    return res.status(200)
    .json(
        {
            success:true,
            data:organizationUpdate
        }
    );
});

export const deleteOrganization = asyncHandler(async(req,res)=>{

    const organizationDelete = await deleteOrganizationService(
        req.user._id,
        req.params.org_id,
    );

    return res.status(200)
    .json(
        {
            success:true,
            message:"organization is delete"
        }
    );
});
