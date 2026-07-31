import {body,param} from "express-validator";

export const createOrgnizationValidator = [
    body('name')
    .trim()
    .notEmpty()
    .withMessage('orgnization name is required')
    .isLength({min:3, max:100})
    .withMessage('Orgnization name must be between 3 and 100 charcters'),

    body('description')
    .optional()
    .trim()
    .isLength({max:500})
    .withMessage('Description cannot exceed 500 characters'),
];

export const organizationIdValidator = [
  param("organizationId")
    .isMongoId()
    .withMessage("Invalid Organization Id"),
];

export const updateOrganizationValidator = [
  ...organizationIdValidator,

  body("name")
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Organization name must be between 3 and 100 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),
];