import asyncHandler from "../utils/asyncHandler.js";
import { inviteUserService } from "../services/invitation.service.js";;


export const inviteUser = asyncHandler(async(req,res)=>{

    const invitation = await inviteUserService(
        req.user._id,
        req.params.org_id,
        req.body,
    );

    return res.status(201)
    .json({
        success: true,
        message: "Invitation sent successfully.",
        data: invitation,
    });


});