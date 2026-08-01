import { Invitation } from "../models/invitation.model.js";
import { Membership } from "../models/membership.model.js";
import { Organization } from "../models/organization.model.js";
import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import crypto from "crypto";

export const inviteUserService = async(
    userId,
    organizationId,
    invitationData
)=>{

    //1. Organization Exists?

    const organization = await Organization.findById(
        organizationId
    );

    if(!organization){
        throw new ApiError(404, "Organization not found");
    }

    // 2. Organization Active?

    if(!organization.isActive){
        throw new ApiError(400, "Organization is inactive.");
    }; 
    
    // 3. Logged User is Member?

    const membership = await Membership.findOne({
        userId,
        organizationId,
        isActive:true
    }).select("role");

    if(!membership){
        throw new ApiError(403,"You are not a member of this organization.")
    };


    // 4. Role Check?

    const allowedRoles = ["owner", "admin"];

    if (!allowedRoles.includes(membership.role)) {
    throw new ApiError(
        403,
        "You are not allowed to invite members."
    )
    };

    // 5 Email Valid? its handle by express vaildater 

    // 6. User Exists?

    const {email,role}= invitationData;

    const user = await User.findOne({email});

    // if(!user){
    //     throw new ApiError(404,'user not found')
    // };

    // 7. Already Member?

  if(user){

    const alreadyMember = await Membership.findOne({
        organizationId,
        userId: user._id,
        isActive: true
    });

    if (alreadyMember) {
        throw new ApiError(
            409,
            "User is already a member of this organization."
        );
    }

  };

    // 7 Pending Invite Exists?

    const pendingInvitation = await Invitation.findOne(
        {
            organizationId,
            email,
            status:"pending",
            isActive:true,
        }
    );

    if(pendingInvitation){
        throw new ApiError(409,'you already sent the invitation before')
    };

    // 8 Generate Token

    const invitationToken = crypto.randomBytes(32).toString('hex');
    
    const expiresAt = new Date(
        Date.now() + 24*60*60*1000
    );

    const invitation = await Invitation.create({
        organizationId,
        email,
        role,
        invitedBy:userId,
        token:invitationToken,
        expiresAt,
    });













};


/*

1. Organization Exists?

2. Organization Active?

3. Logged User is Member?

4. Role Check?

5. Email Valid?

6. User Exists?

7. Already Member?

8. Pending Invite Exists?

9. Generate Token

10. Create Invitation

11. Send Email

**/
