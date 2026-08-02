import  express from "express";
import { authUser } from "../middlewares/authuser.middleare.js";
import { acceptInvitationValidator, inviteUserValidator } from "../validator/invitation.validator.js";
import { validate } from "../middlewares/vaildate.middleware.js";
import { inviteUser,acceptInvitation } from "../controllers/invitation.controller.js";

const router = express.Router();

router.post('/organization/:org_id/invitations',
    authUser,
    inviteUserValidator,
    validate,
    inviteUser
);

router.post('/accept/:token',authUser,acceptInvitationValidator,validate,acceptInvitation);

export default router;