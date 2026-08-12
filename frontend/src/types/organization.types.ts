import type { Role } from "./membership.types";

/** Minimal organization shape as populated inside a Membership record. */
export interface OrganizationSummary {
  _id: string;
  name: string;
  slug: string;
  description?: string;
}

/** Full organization document, as returned by GET /org/organization/:org_id */
export interface Organization {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * GET /org/organizations returns the caller's Membership records
 * (each populated with its organization), not raw organizations.
 */
export interface MyOrganizationEntry {
  _id: string;
  userId: string;
  organizationId: OrganizationSummary;
  role: Role;
  invitedBy: string | null;
  joinedAt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrganizationPayload {
  name: string;
  description?: string;
}

export interface UpdateOrganizationPayload {
  name?: string;
  description?: string;
}
