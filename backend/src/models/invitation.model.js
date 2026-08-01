import mongoose from "mongoose";

const invitationSchema = new mongoose.Schema({

    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization",
        required: true,
    },

    email:{
        type:String,
        required:true,
        lowercase:true,
        trim:true
    },

    role: {
      type: String,
      enum: ["admin", "member","viewer"],
      default: "member",
    },

    invitedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required:true,
    },

    status:{
        type:String,
        enum:['pending', 'accepted', 'rejected', 'expired'],
        default:'pending',
    },

    token:{
        type:String,
        required:true,
        unique:true
    },

    expiresAt:{
        type:Date,
        required:true
    },

    acceptedAt:{
        type:Date,
        default:null,
        index:true,
    },

    isActive:{
        type:Boolean,
        default:true
    },

},{
    timestamps:true,
    versionKey:false
});

invitationSchema.index(
    {
        organizationId:1,
        email:1,
        status:1
    }
);

export const Invitation = mongoose.model("Invitation",invitationSchema);