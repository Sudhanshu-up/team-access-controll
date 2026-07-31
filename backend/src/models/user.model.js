import mongoose from "mongoose";
import bcrypt from"bcrypt";

import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true ,
    versionKey:false,
  },
);



userSchema.methods.generateAuthToken = function(){
    const token = jwt.sign({_id:this._id}, process.env.JWT_SECRET,{expiresIn:'24h'})
    return token;
};

userSchema.methods.comparePassword =  async function(password){
    return await bcrypt.compare(password,this.password);
};

userSchema.statics.hashPassword = async (password)=>{
    return await bcrypt.hash(password,10);
};
    


export const User = mongoose.model("User", userSchema);
