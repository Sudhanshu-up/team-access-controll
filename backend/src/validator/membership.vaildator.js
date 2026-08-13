import { body, param } from "express-validator";

export const membershipValidator = [
  param("org_id")
    .isMongoId()
    .withMessage("Invalid Organization Id"),
];

export const membershipIdValidator = [
  param("membershipId")
    .isMongoId()
    .withMessage("Invalid Membership Id"),
];

export const updateMemberRoleValidator = [
  param("membershipId")
    .isMongoId()
    .withMessage("Invalid Membership Id"),

  body("role")
    .isIn(["admin", "member", "viewer"])
    .withMessage("Role must be admin, member or viewer"),
];

export const leaveOrganizationValidator = [
  param("org_id")
    .isMongoId()
    .withMessage("Invalid Organization Id"),
];