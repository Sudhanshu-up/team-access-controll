import { User } from "../models/user.model.js";
import { userCreateService } from "../services/user.service.js";
import { validationResult } from "express-validator";
import asyncHandler from "../utils/asyncHandler.js";
import { BlacklistToken } from "../models/blacklist.model.js";


export const registerUser = asyncHandler( async(req,res,next)=>{

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res
        .status(400)
        .json({errors: errors.array()});
    };

    const {name, email, password} = req.body;

    const isUserAlreadyExist = await User.findOne({email});

    if(isUserAlreadyExist){
        return res.status(400)
        .json({message:'user already exist'});
    };

    const hashPassword = await User.hashPassword(password);
    console.log(req.body);
    console.log(hashPassword);

    const user = await userCreateService({
        name,
        email,
        password:hashPassword,
    });

    const token = user.generateAuthToken();

    res.status(201)
    .json({token,user})
});

export const loginUser = asyncHandler(async(req,res,next)=>{

    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400)
        .json({errors: errors.array()});
    };

    const {email,password}=req.body;

    const user = await User.findOne({email}).select('+password');
    if(!user){
        return res.status(401)
        .json({message:'invaild password or email'});
    };

    const matchPassword = await user.comparePassword(password);
    if(!matchPassword){
        return res.status(401)
        .json({message:"invail email or password"});
    };


    const token = user.generateAuthToken();

    res.cookie('token',token,{
        httpOnly:true,
        secure: process.env.NODE_ENV==='production',
        maxAge:3600000
    });

    res.status(201)
    .json({token,user});
});

export const logOutUser = asyncHandler(async(req,res,next)=>{
   res.clearCookie('token');

    const token = req.cookies.token || req.headers.authorization.split(' ')[1];
    await BlacklistToken.create({token});
    res.status(200)
    .json({message:'user LogOut Successfully'})

});

export const getUserProfile = asyncHandler(async(req,res,next)=>{
    res.status(200)
    .json(req.user);
});
