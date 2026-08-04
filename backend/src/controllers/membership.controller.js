import { membershipService, updateMemberRoleService,deleteMemberService } from "../services/membership.service.js";
import asyncHandler from "../utils/asyncHandler.js";

export const aboutmembership = asyncHandler(async(req,res)=>{

    const membership = await membershipService(
        req.user,
        req.params.org_id,
    );
    return res.status(201)
    .json({
        success: true,
        data: membership,
    });

});

export const updateMemberRole = asyncHandler(async(req,res)=>{

    const updateMemberRole = await updateMemberRoleService(
        req.user,
        req.params.membershipId,
        req.body.role
    );
    return res.status(200)
    .json({
        success: true,
        data: updateMemberRole,
    });

});

export const deleteMember = asyncHandler(async(req,res)=>{

    const removedMember = await deleteMemberService(
        req.user,
        req.params.membershipId,
    );
    return res.status(200).json({
        success: true,
        message: "Member removed successfully.",
        data: removedMember,
    });
});



