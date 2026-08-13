import express from "express";
import { authUser } from "../middlewares/authuser.middleare.js";
import {
  membershipIdValidator,
  membershipValidator,
  updateMemberRoleValidator,
  leaveOrganizationValidator,
} from "../validator/membership.vaildator.js";
import { validate } from "../middlewares/vaildate.middleware.js";
import { aboutmembership ,updateMemberRole, deleteMember,leaveMember} from "../controllers/membership.controller.js";
const router = express.Router();

router.get(
  "/organization/:org_id/members",
  authUser,
  membershipValidator,
  validate,
  aboutmembership
);

router.patch(
  "/members/:membershipId/role",
  authUser,
  updateMemberRoleValidator,
  validate,
  updateMemberRole
);

router.delete(
  "/members/:membershipId",
  authUser,
  membershipIdValidator,
  validate,
  deleteMember
);

router.post(
  "/organization/:org_id/leave",
  authUser,
  leaveOrganizationValidator,
  validate,
  leaveMember
);

export default router;