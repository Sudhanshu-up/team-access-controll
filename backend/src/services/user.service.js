import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";


export const userCreateService = async(
    {
        name,
        email,
        password,

    }
)=>{

    console.log({
        name,
        email,
        password,
    });
   
    if(!name || !email || !password){
        throw new ApiError(400,"all fields are required");
    };

    const user = await User.create({
        name,
        email,
        password,
    });

    return user;
};

