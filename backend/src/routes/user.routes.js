import express from "express";
import {body} from "express-validator";
import { registerUser,loginUser,logOutUser, getUserProfile } from "../controllers/user.controller.js";
import { authUser } from "../middlewares/authuser.middleare.js";

const router = express.Router();

router.post('/register',[
    body('name').isLength({min:3}).withMessage("name must be 3 char"),
    body('email').isEmail().withMessage("Invaild Email"),
    body('password').isLength({min:4}).withMessage('password must be at least 5 char and strong')
],
registerUser);
router.post('/login',[
    body('email').isEmail().withMessage("Invaild Email"),
    body('password').isLength({min:4}).withMessage('password must be at least 5 char and strong')
],
loginUser);

router.get('/logout',authUser,logOutUser);
router.get('/profile',authUser,getUserProfile);


export default router;


