import  express from "express";
import { authUser } from "../middlewares/authuser.middleare.js";
import { inviteUserValidator } from "../validator/invitation.validator.js";
import { validate } from "../middlewares/vaildate.middleware.js";
import { inviteUser } from "../controllers/invitation.controller.js";

const router = express.Router();

router.post('/organization/:org_id/invitations',
    authUser,
    inviteUserValidator,
    validate,
    inviteUser
);

export default router;