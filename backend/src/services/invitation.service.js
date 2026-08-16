import { Invitation } from "../models/invitation.model.js";
import { Membership } from "../models/membership.model.js";
import { Organization } from "../models/organization.model.js";
import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";
import { invitationTemplate } from "../templates/invitationEmail.template.js";
import mongoose from "mongoose";


export const inviteUserService = async (
  currentUser,
  organizationId,
  invitationData,
) => {
  const userId = currentUser._id;
  const invitedByName = currentUser.name;
  const invitedById = currentUser._id;

  //1. Organization Exists?

  const organization = await Organization.findById(organizationId);

  if (!organization) {
    throw new ApiError(404, "Organization not found");
  }

  // 2. Organization Active?

  if (!organization.isActive) {
    throw new ApiError(400, "Organization is inactive.");
  }

  // 3. Logged User is Member?

  const membership = await Membership.findOne({
    userId,
    organizationId,
    isActive: true,
  }).select("role");

  if (!membership) {
    throw new ApiError(403, "You are not a member of this organization.");
  }

  // 4. Role Check?

  const allowedRoles = ["owner", "admin"];

  if (!allowedRoles.includes(membership.role)) {
    throw new ApiError(403, "You are not allowed to invite members.");
  }

  // 5 Email Valid? its handle by express vaildater

  // 6. User Exists?
  const { email, role } = invitationData;
  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail });

  // if(!user){
  //     throw new ApiError(404,'user not found')
  // };

  // 7. Already Member?

  if (user) {
    const alreadyMember = await Membership.findOne({
      organizationId,
      userId: user._id,
      isActive: true,
    });

    if (alreadyMember) {
      throw new ApiError(409, "User is already a member of this organization.");
    }
  }

  // 7 Pending Invite Exists?

  const pendingInvitation = await Invitation.findOne({
    organizationId,
    email: normalizedEmail,
    status: "pending",
    isActive: true,
  });

  if (pendingInvitation) {
    throw new ApiError(409, "you already sent the invitation before");
  }

  // 8 Generate Token

  const invitationToken = crypto.randomBytes(32).toString("hex");

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  // 10. Create Invitation

  const invitation = await Invitation.create({
    organizationId,
    email: normalizedEmail,
    role,
    invitedBy: invitedById,
    token: invitationToken,
    expiresAt,
  });

  // 11. Invitation Link

  const invitationLink = `${process.env.CLIENT_URL}/accept-invitation/${invitationToken}`;

  // reject invitation link
  const rejectInvitationLink = `${process.env.CLIENT_URL}/reject-invitation/${invitationToken}`;

  // 12. Send Email
  // Invitation row is already saved at this point — agar email fail ho
  // (SMTP config galat/missing) to poore request ko fail nahi karna,
  // warna client ko lagta hai invite hi fail ho gaya. Isliye ab sirf
  // log karke `emailSent: false` bhej denge.
  let emailSent = true;
  try {
    await sendEmail({
      to: normalizedEmail,
      subject: "Invitation to Join Organization",
      html: invitationTemplate({
        organizationName: organization.name,
        invitedBy: invitedByName,
        invitationLink,
        rejectInvitationLink,
      }),
    });
  } catch (error) {
    console.error("INVITATION EMAIL ERROR:", error);
    emailSent = false;
  }

  return { ...invitation.toObject(), emailSent };
};

export const acceptInvitationService = async (LoggedInUser, token) => {
    const invitation = await Invitation.findOne({
      token,
    }).select(
        "email organizationId role invitedBy status expiresAt isActive acceptedAt")
    .populate({
      path: "organizationId",
      select: "name isActive",
    });



    if (!invitation) {
      throw new ApiError(404, "Invitation not found.");
    }

    if (!invitation.organizationId) {
    throw new ApiError(
        404,
        "Organization not found."
    );
    } 

    if (!invitation.organizationId.isActive) {
    throw new ApiError(
        400,
        "Organization is inactive."
    );
    }

    if (!invitation.isActive) {
      throw new ApiError(400, "Invitation is Inactive.");
    }

    if (invitation.expiresAt < new Date()) {
      invitation.status = "expired";
      invitation.isActive = false;
      await invitation.save();

      throw new ApiError(400, "Invitation has expired.");
    }

    if (invitation.status === "accepted") {
      throw new ApiError(400, "Invitation already accepted.");
    }

    if (invitation.status === "rejected") {
      throw new ApiError(400, "Invitation already rejected.");
    }

    if (LoggedInUser.email !== invitation.email) {
      throw new ApiError(
        403,
        "This invitation is not associated with your account.",
      );
    }

    const existingMembership = await Membership.findOne({
      organizationId: invitation.organizationId._id,

      userId: LoggedInUser._id,

      isActive: true,
    });
    if (existingMembership) {
      throw new ApiError(409, "user is alreary associated with Organization");
    }

    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      await Membership.create(
        [
          {
            userId: LoggedInUser._id,
            organizationId: invitation.organizationId._id,
            role: invitation.role,
            invitedBy: invitation.invitedBy,
          },
        ],
        { session },
      );

      invitation.status = "accepted";
      invitation.acceptedAt = new Date();
      invitation.isActive = false;
      await invitation.save({ session });

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();

      throw error;
    } finally {
      session.endSession();
    }

    return {
      invitation,
      organization: invitation.organizationId,
    };
};

export const rejectInvitationService = async(LoggedInUser,token)=>{

  
  const invitation = await Invitation.findOne({token})
  .select("email organizationId status expiresAt isActive rejectedAt")
  .populate({
    path: "organizationId",
    select: "name isActive",
  });


  if(!invitation) {
    throw new ApiError(404, "Invitation not found.");
  };

  if(!invitation.organizationId){
    throw new ApiError(404,'organization not found')
  };

  if (!invitation.organizationId.isActive) {
  throw new ApiError(
      400,
      "Organization is inactive."
  )};

  if (!invitation.isActive) {
    throw new ApiError(400, "Invitation is Inactive.");
  }

  if (invitation.expiresAt < new Date()) {
    invitation.status = "expired";
    invitation.isActive = false;
    await invitation.save();

    throw new ApiError(400, "Invitation has expired.");
  }

  if (invitation.status === "accepted") {
    throw new ApiError(400, "Invitation already accepted.");
  }

  if (invitation.status === "rejected") {
    throw new ApiError(400, "Invitation already rejected.");
  };

  if (LoggedInUser.email !== invitation.email) {
    throw new ApiError(
      403,
      "This invitation is not associated with your account.",
    );
  };
  

  invitation.status = "rejected";

  invitation.isActive = false;

  invitation.rejectedAt = new Date();

  await invitation.save();

  return invitation;

  
};


export const cancelInvitationService = async (currentUser, invitationId) => {

  // 1. Find Invitation
  const invitation = await Invitation.findById(invitationId);

  if (!invitation) {
    throw new ApiError(404, "Invitation not found.");
  }

  // 2. Already inactive?
  if (!invitation.isActive) {
    throw new ApiError(400, "Invitation is already inactive.");
  }

  // 3. Find Organization
  const organization = await Organization.findById(
    invitation.organizationId
  );

  if (!organization) {
    throw new ApiError(404, "Organization not found.");
  }

  // 4. Organization Active?
  if (!organization.isActive) {
    throw new ApiError(400, "Organization is inactive.");
  }

  // 5. Current User Membership
  const currentMembership = await Membership.findOne({
    userId: currentUser._id,
    organizationId: invitation.organizationId,
    isActive: true,
  });

  if (!currentMembership) {
    throw new ApiError(
      403,
      "You are not a member of this organization."
    );
  }

  // 6. Permission Check
  const allowedRoles = ["owner", "admin"];

  if (!allowedRoles.includes(currentMembership.role)) {
    throw new ApiError(
      403,
      "You are not allowed to cancel invitations."
    );
  }

  // 7. Invitation State
  if (invitation.status === "accepted") {
    throw new ApiError(400, "Accepted invitation cannot be cancelled.");
  }

  if (invitation.status === "rejected") {
    throw new ApiError(400, "Rejected invitation cannot be cancelled.");
  }

  if (invitation.status === "cancelled") {
    throw new ApiError(400, "Invitation is already cancelled.");
  }

  if (invitation.status === "expired") {
    throw new ApiError(400, "Expired invitation cannot be cancelled.");
  }

  // 8. Cancel Invitation
  invitation.status = "cancelled";
  invitation.isActive = false;
  invitation.cancelledAt = new Date();
  invitation.cancelledBy = currentUser._id;

  await invitation.save();

  return invitation;
};


export const getOrganizationInvitationsService = async (
  currentUser,
  organizationId,
) => {
  // 1. Organization Exists?
  const organization = await Organization.findById(organizationId);

  if (!organization) {
    throw new ApiError(404, "Organization not found.");
  }

  // 2. Organization Active?
  if (!organization.isActive) {
    throw new ApiError(400, "Organization is inactive.");
  }

  // 3. Current User Membership
  const currentMembership = await Membership.findOne({
    userId: currentUser._id,
    organizationId,
    isActive: true,
  }).select("role");

  if (!currentMembership) {
    throw new ApiError(
      403,
      "You are not a member of this organization.",
    );
  }

  // 4. Permission Check
  const allowedRoles = ["owner", "admin"];

  if (!allowedRoles.includes(currentMembership.role)) {
    throw new ApiError(
      403,
      "You are not allowed to view organization invitations.",
    );
  }

  // 5. Fetch Pending Invitations
  const invitations = await Invitation.find({
    organizationId,
    status: "pending",
    isActive: true,
  })
    .select(
      "email role invitedBy status expiresAt createdAt",
    )
    .populate({
      path: "invitedBy",
      select: "name email",
    })
    .sort({
      createdAt: -1,
    });

  return invitations;
};

export const resendInvitationService = async (
  currentUser,
  invitationId,
) => {
  // 1. Find invitation
  const invitation = await Invitation.findById(invitationId);

  if (!invitation) {
    throw new ApiError(404, "Invitation not found.");
  }

  // 2. Organization exists?
  const organization = await Organization.findById(
    invitation.organizationId,
  );

  if (!organization) {
    throw new ApiError(404, "Organization not found.");
  }

  // 3. Organization active?
  if (!organization.isActive) {
    throw new ApiError(400, "Organization is inactive.");
  }

  // 4. Current user's membership
  const currentMembership = await Membership.findOne({
    userId: currentUser._id,
    organizationId: invitation.organizationId,
    isActive: true,
  }).select("role");

  if (!currentMembership) {
    throw new ApiError(
      403,
      "You are not a member of this organization.",
    );
  }

  // 5. Permission
  const allowedRoles = ["owner", "admin"];

  if (!allowedRoles.includes(currentMembership.role)) {
    throw new ApiError(
      403,
      "You are not allowed to resend invitations.",
    );
  }

  // 6. Invitation state check
  if (
    invitation.status !== "pending" &&
    invitation.status !== "expired"
  ) {
    throw new ApiError(
      400,
      "Only pending or expired invitations can be resent.",
    );
  }

  // 7. Generate new secure token
  const newToken = crypto.randomBytes(32).toString("hex");

  // 8. New expiry — 24 hours
  const newExpiresAt = new Date(
    Date.now() + 24 * 60 * 60 * 1000,
  );

  // 9. Reset invitation
  invitation.token = newToken;
  invitation.expiresAt = newExpiresAt;
  invitation.status = "pending";
  invitation.isActive = true;

  await invitation.save();

  // 10. Generate fresh links
  const invitationLink =
    `${process.env.CLIENT_URL}/accept-invitation/${newToken}`;

  const rejectInvitationLink =
    `${process.env.CLIENT_URL}/reject-invitation/${newToken}`;

  // 11. Send email
  let emailSent = true;
  try {
    await sendEmail({
      to: invitation.email,

      subject: "Reminder: Invitation to Join Organization",

      html: invitationTemplate({
        organizationName: organization.name,
        invitedBy: currentUser.name,
        invitationLink,
        rejectInvitationLink,
      }),
    });
  } catch (error) {
    console.error(
      "RESEND INVITATION EMAIL ERROR:",
      error,
    );
    emailSent = false;
  }

  return { ...invitation.toObject(), emailSent };
};