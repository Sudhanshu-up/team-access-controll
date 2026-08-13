import  express from "express";
import { authUser } from "../middlewares/authuser.middleare.js";
import { acceptInvitationValidator, inviteUserValidator, cancelInvitationValidator,getInvitationValidator } from "../validator/invitation.validator.js";
import { validate } from "../middlewares/vaildate.middleware.js";
import { inviteUser,acceptInvitation,rejectInvitation,cancelInvitation, getOrganizationInvitations,resendInvitation } from "../controllers/invitation.controller.js";

const router = express.Router();

router.post('/organization/:org_id/invitations',
    authUser,
    inviteUserValidator,
    validate,
    inviteUser
);

router.post('/accept/:token',authUser,acceptInvitationValidator,validate,acceptInvitation);

router.post('/reject/:token/invitations',authUser,acceptInvitationValidator,validate,rejectInvitation);

router.delete("/cancel/:invitationId",authUser,cancelInvitationValidator,validate,cancelInvitation);

router.get("/organization/:org_id/invitations",authUser,getInvitationValidator,validate,getOrganizationInvitations);

router.post("/resend/:invitationId",authUser,cancelInvitationValidator,validate,resendInvitation);
export default router;

