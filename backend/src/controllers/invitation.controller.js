import asyncHandler from "../utils/asyncHandler.js";
import { acceptInvitationService, inviteUserService,rejectInvitationService,cancelInvitationService,getOrganizationInvitationsService,resendInvitationService } from "../services/invitation.service.js";;


export const inviteUser = asyncHandler(async(req,res)=>{

    const invitation = await inviteUserService(
        req.user,
        req.params.org_id,
        req.body,
    );

    return res.status(201)
    .json({
        success: true,
        message: invitation.emailSent
          ? "Invitation sent successfully."
          : "Invitation created, but the email could not be sent. Check your mail server configuration.",
        data: invitation,
    });


});

export const acceptInvitation = asyncHandler(async(req,res)=>{
    const invitation = await acceptInvitationService(
        req.user,
        req.params.token
    );

    return res.status(200).json({
        success:true,
        message:'Invitation Accepted Successfully',
        data:invitation
    });
});

export const rejectInvitation = asyncHandler(async(req,res)=>{
    const rejectInvite = await rejectInvitationService(
        req.user,
        req.params.token,
    );

    return res.status(200).json({
        success:true,
        message:'Invitation Rejected',
        data:rejectInvite
    });
});
export const cancelInvitation = asyncHandler(async (req, res) => {
  const cancelledInvitation = await cancelInvitationService(
    req.user,
    req.params.invitationId,
  );

  return res.status(200).json({
    success: true,
    message: "Invitation cancelled successfully.",
    data: cancelledInvitation,
  });
});
export const getOrganizationInvitations = asyncHandler(
  async (req, res) => {
    const invitations = await getOrganizationInvitationsService(
      req.user,
      req.params.org_id,
    );

    return res.status(200).json({
      success: true,
      data: invitations,
    });
  },
);
export const resendInvitation = asyncHandler(async (req, res) => {
  const invitation = await resendInvitationService(
    req.user,
    req.params.invitationId,
  );

  return res.status(200).json({
    success: true,
    message: invitation.emailSent
      ? "Invitation resent successfully."
      : "Invitation updated, but the email could not be sent. Check your mail server configuration.",
    data: invitation,
  });
});