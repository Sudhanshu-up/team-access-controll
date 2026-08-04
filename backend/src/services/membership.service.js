import { Membership } from "../models/membership.model.js";
import { Organization } from "../models/organization.model.js";
import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";


export const membershipService = async(currentUser,organizationId)=>{

    // Organization Exists?

    const organization = await Organization.findById(organizationId);
    
    if(!organization){
        throw new ApiError(404,"organization not found")
    };

    // Organization Active?

    if(!organization.isActive){
        throw new ApiError(400, "organization is inactive")
    };

    const membership = await Membership.findOne({
        userId:currentUser._id,
        organizationId,
        isActive:true,
    });

    if(!membership){
        throw new ApiError(403,'you are not a member of this oragnization')
    };

    // Fetch Members

    const members = await Membership.find({
        organizationId,
        isActive:true,
    }).select('role invitedBy joinedAt')
    .populate({
        path:'userId',
        select:'name email'
    }).sort({
    joinedAt:1
    });


    return members;




};


export const updateMemberRoleService = async (currentUser, membershipId ,role) => {


    // Find Target Membership

    const targetMembership = await Membership.findById(membershipId).populate({
    path:"userId",
    select:"name email"
    });;

    if(!targetMembership){
        throw new ApiError(404,'Membership not found')
    };

    // Organization Exists?

    const oragnization = await Organization.findById(
        targetMembership.organizationId
    );

    if(!oragnization){
        throw new ApiError(404,"Organization not found ");
    }

    if(!oragnization.isActive){
        throw new ApiError(400,'Oragnization is Inactive')
    };

    // Logged-in User Membership?

    const currentMembership = await Membership.findOne({
        userId:currentUser._id,
        organizationId:targetMembership.organizationId,
        isActive:true,
    });

    if(!currentMembership){
        throw new ApiError(403,"you are not a member of this Oragnization")
    };

    // Permission Check

    const allowedRole = ['owner', 'admin'];

    if(!allowedRole.includes(currentMembership.role)){
        throw new ApiError(403,'you are not allowed to update member roles')
    };

    // Self Update?

    if(currentMembership._id.toString() ===
     targetMembership._id.toString()){
        throw new ApiError(400,'you can not change your own role')
    };

    // Target Owner?

    if(targetMembership.role === 'owner'){
        throw new ApiError(403,'owner role cannot be changed')
    };

    // New Role Valid? also we validate in membershipIdVaildator

    const allowedRoles = ['admin', 'member', 'viewer'];

    if(!allowedRoles.includes(role)){
        throw new ApiError(400,'invalid role')
    };

    // Same Role?

    if(targetMembership.role === role){
        throw new ApiError(400,'member already has this role')
    };

    // Admin Restriction

    if (
    currentMembership.role === "admin" &&
    targetMembership.role === "admin"
    ) {
    throw new ApiError(
        403,
        "Admins cannot change another admin's role."
    )};


    if(
    currentMembership.role === "admin" &&
    role === "admin"
    ){
    throw new ApiError(
        403,
        "Only owner can assign admin role."
    )};

    // await Membership.findByIdAndUpdate(
    // membershipId,
    // {
    //     role,
    // },
    // {
    //     new: true,
    //     runValidators: true,
    // }
    // );

    // Update Role

    targetMembership.role = role;
    await targetMembership.save();

    return targetMembership;


};



/**
 *
Owner          ❌      ✅      ✅      ✅

Admin          ❌      ❌      ✅      ✅

Member         ❌      ❌      ❌      ❌

Viewer         ❌      ❌      ❌      ❌
 */