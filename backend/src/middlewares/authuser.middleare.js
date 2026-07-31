import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { BlacklistToken } from "../models/blacklist.model.js";


export const authUser = async(req, res, next )=>{
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
console.log("Cookies:", req.cookies);
console.log("Authorization:", req.headers.authorization);

    if(!token){
        return res.status(401)
        .json({message:'Unauthorized access.'});
    };
    console.log("Token:", token);

    const isBlacklisted = await BlacklistToken.findOne({token:token});

   


    if(isBlacklisted){
        return res.status(401)
        .json({message:"unauthorized access.. "})
    };

    try {
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        console.log("JWT_SECRET:", process.env.JWT_SECRET);
        const user = await User.findById(decoded._id);
        
        if (!user) {
           return res.status(401).json({
            message: "User not found",
        });
}
        req.user = user;

        return next();
        
    } catch (error) {
        return res.status(401)
        .json({message:"unauthorized access..."})
    }
};
