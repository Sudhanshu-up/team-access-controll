import { Invitation } from "../models/invitation.model.js";
import { Membership } from "../models/membership.model.js";
import { Organization } from "../models/organization.model.js";
import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";
import { invitationTemplate } from "../templates/invitationEmail.template.js";

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

  // 12. Send Email
  try {
    await sendEmail({
      to: normalizedEmail,

      subject: "Invitation to Join Organization",

      html: invitationTemplate({
        organizationName: organization.name,
        invitedBy: invitedByName,
        invitationLink,
      }),
    });
  } catch (error) {
    console.error(error);
  }

  return invitation;
};

export const acceptInvitationService = async (LoggedInUser, token) => {
  const invitation = await Invitation.findOne({
    token,
  }).populate({
    path: "organizationId",
    select: "name isActive",
  });

  if (!invitation) {
    throw new ApiError(404, "Invitation not found.");
  }

  if (!invitation.isActive) {
    throw new ApiError(400, "Invitation is Inactive.");
  }

  if (invitation.expiresAt < new Date()) {
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

  if (!invitation.organizationId?.isActive) {
    throw new ApiError(400, "Organization is inactive");
  }

  import { Invitation } from "../models/invitation.model.js";
  import { Membership } from "../models/membership.model.js";
  import { Organization } from "../models/organization.model.js";
  import { User } from "../models/user.model.js";
  import ApiError from "../utils/ApiError.js";
  import crypto from "crypto";
  import { sendEmail } from "../utils/sendEmail.js";
  import { invitationTemplate } from "../templates/invitationEmail.template.js";

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
        throw new ApiError(
          409,
          "User is already a member of this organization.",
        );
      }
    }

    // 7 Pending Invite Exists?

    const pendingInvitation = await Invitation.findOne({
      organizationId,
      normalizedEmail,
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

    // 12. Send Email
    try {
      await sendEmail({
        to: email,

        subject: "Invitation to Join Organization",

        html: invitationTemplate({
          organizationName: organization.name,
          invitedBy: invitedByName,
          invitationLink,
        }),
      });
    } catch (error) {
      console.error(error);
    }

    return invitation;
  };

  export const acceptInvitationService = async (LoggedInUser, token) => {
    const invitation = await Invitation.findOne({
      token,
    }).populate({
      path: "organizationId",
      select: "name isActive",
    });

    if (!invitation) {
      throw new ApiError(404, "Invitation not found.");
    }

    if (!invitation.isActive) {
      throw new ApiError(400, "Invitation is Inactive.");
    }

    if (invitation.expiresAt < new Date()) {
      throw new ApiError(400, "Invitation has expired.");
    }

    invitation.status = "expired";
    await invitation.save();

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
  };

  const existingMembership = await Membership.findOne({
    organizationId: invitation.organizationId,

    userId: LoggedInUser._id,

    isActive: true,
  });
  if (existingMembership) {
    throw new ApiError(409, "user is Aleary associated with Organization");
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Membership.create()

    // Invitation.status="accepted"

    // acceptedAt = new Date()

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();

    throw error;
  } finally {
    session.endSession();
  }
};
