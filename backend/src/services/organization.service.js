import { Organization } from "../models/organization.model.js";
import { Membership } from "../models/membership.model.js";
import ApiError from "../utils/ApiError.js";

import mongoose from "mongoose";
import slugify from "slugify";

export const createOrganizationService = async(
    {
       name,
       description,
       userId, 
    })=>{
                 // start the mongoDb Session
        const session = await mongoose.startSession();

        try {
            // start Transaction
            session.startTransaction();

            const slug = slugify(name,{
                lower:true,
                strict:true,
                trim:true,
            });

            const existingOrganization = await Organization.findOne({slug});

            if(existingOrganization){
                throw new ApiError(409,  'Organization already exists');
            };

            const organization = await Organization.create(
                [
                    {
                        name,
                        slug,
                        description,
                        createdBy:userId,
                    },
                ],
                {session}
            );

            // create membershipe
            await Membership.create(
                [
                    {
                        userId,
                        organizationId:organization[0]._id,
                        role:"owner",
                    },
                ],
                {session}
            );

            await session.commitTransaction();

            return organization[0];

        } catch (error) {
            //rollback
            await session.abortTransaction();

            throw error;
        }finally{
            session.endSession();
        }

};

export const getMyOrganizationsService = async (userId) => {
  // //1 find all membership of logged in user
  // const membership = await Membership.find(
  //     { userId, isActive:true}

  // ).select("organizationId role");

  // // 2 Extract organization ids

  // const organizationIds = membership.map(
  //     (membership)=> membership.organizationId
  // );

  // //3 Fetch organtion ids

  // const oranizations = await Organization.find(
  //     {
  //         _id:{$in:organizationIds},
  //         isActive:true,

  //     }
  // );

  // return oranizations;

  const memberships = await Membership.find(
    {
      userId,
      isActive: true,
    }
  ).populate(
    {
      path: "organizationId",
      select: "name slug description",
    });

  return memberships;

  
};

export const getMyOrganizationsByIdService = async(userId,organizationId)=>{

    const membership = await Membership.findOne({
        userId,
        organizationId,
        isActive:true
    });
    console.log(membership);

    if(!membership){
        throw new ApiError(403,'Access denied. You are not a member of this organization.');
    };

    const organization = await Organization.findById(organizationId)
    .populate({
        path:'createdBy',
        select:'name email'
    });

    if(!organization){
        throw new ApiError(404,'organization not exist')
    };

    return organization;
};

export const updateOrganizationService = async(userId,organizationId,updateData)=>{

    // Find Membership

    const membership = await Membership.findOne({
        userId,
        organizationId,
        isActive:true
    });

    console.log("userid:",userId, "org:",organizationId);

    // Check Membership

    if(!membership){
        throw new ApiError(
            403,'Access denide. You are not member of this organization.'
        );
    };

    // Check Role

    if(membership.role !== "owner" && membership.role !== "admin"){
        throw new ApiError(403,"you do not have parmission to Update this Organzation")
    };
    
    // Find Organization

    // Update Organization

    if(updateData.name){
        updateData.slug = slugify(updateData.name,{
            lower:true,
            strict:true
        });
    }
    const organization = await Organization.findByIdAndUpdate(
        organizationId,
        updateData,
        {
            new:true,
            runValidators:true
        }
    );


    if(!organization){
        throw new ApiError(
            404, "organization not found"
        );
    };


    // Return Updated Organization

    return organization;
}

export const deleteOrganizationService = async (userId, organizationId) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const membership = await Membership.findOne({
      userId,
      organizationId,
      isActive: true,
    }).session(session);
    

    if (!membership) {
      throw new ApiError(
        403,
        "access denide. you are not part of Oraganization",
      );
    }

    if (membership.role !== "owner") {
      throw new ApiError(
        403,
        "you do not have parmission to softdelete is this Organzation",
      );
    }

    const organization = await Organization.findById(organizationId);

    if (!organization) {
      throw new ApiError(404, "organization does not exists");
    }

    organization.isActive = false;

    await organization.save({ session });

    await Membership.updateMany(
      {
        organizationId,
        isActive: true,
      },
      {
        $set: { isActive: false },
      },
      { session },
    );

    await session.commitTransaction();

    return organization;
  } catch (error) {
    await session.abortTransaction();

    throw error;
  } finally {
    await session.endSession();
  }
};
