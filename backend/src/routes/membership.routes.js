import express from "express";
import { authUser } from "../middlewares/authuser.middleare.js";
import { membershipIdValidator, membershipValidator } from "../validator/membership.vaildator.js";
import { validate } from "../middlewares/vaildate.middleware.js";
import { aboutmembership ,updateMemberRole, deleteMember} from "../controllers/membership.controller.js";
const router = express.Router();

router.get('/organization/:org_id/members',authUser,membershipValidator,validate,aboutmembership);
router.patch('/members/:membershipId/role',authUser,membershipIdValidator,validate,updateMemberRole);
router.delete('/members/:membershipId',authUser,membershipIdValidator,validate,deleteMember);
export default router;