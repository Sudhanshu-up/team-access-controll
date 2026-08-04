import { body,param } from "express-validator";

export const membershipValidator = [
    param('org_id')
    .isMongoId()
    .withMessage('must give the organization id')
];

export const membershipIdValidator = [
  param("membershipId")
  .isMongoId()
  .withMessage("Invalid Membership Id"),

  body("role")
      .isIn(["admin", "member", "viewer"])
      .withMessage("Role must be admin, member or viewer")
];