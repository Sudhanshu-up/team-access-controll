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

