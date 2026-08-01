import {body,param} from "express-validator";

export const inviteUserValidator = [

  param("org_id")
    .isMongoId()
    .withMessage("Invalid organization id"),

  body("email")
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("role")
    .isIn(["admin", "member", "viewer"])
    .withMessage("Role must be admin, member or viewer")

];