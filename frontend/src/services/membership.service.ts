import { api } from "@/api/axios";
import type { ApiEnvelope } from "@/types/api.types";
import type { Member, Role } from "@/types/membership.types";

export const membershipService = {
  async listByOrg(orgId: string): Promise<Member[]> {
    const { data } = await api.get<ApiEnvelope<Member[]>>(
      `/api/v1/members/organization/${orgId}/members`
    );
    return data.data;
  },

  async updateRole(membershipId: string, role: Role): Promise<Member> {
    const { data } = await api.patch<ApiEnvelope<Member>>(
      `/api/v1/members/members/${membershipId}/role`,
      { role }
    );
    return data.data;
  },

  /**
   * NOTE: the backend re-uses `membershipIdValidator` for this route, which
   * also requires a `role` field in the body (a validator copy/paste bug —
   * `deleteMemberService` itself never reads it). We send a harmless
   * placeholder value purely to satisfy that validation rule.
   */
 async remove(membershipId: string): Promise<void> {
  await api.delete(
    `/api/v1/members/members/${membershipId}`
  );
 },

  /**
   * NOTE: the backend route is `/organization/:org_id/leave`, but it is
   * guarded by `membershipIdValidator`, which validates a `:membershipId`
   * route param that doesn't exist on this route. Every call to this
   * endpoint currently fails validation (400) regardless of what the
   * client sends — this is a backend bug outside the frontend's control.
   */
  async leave(orgId: string): Promise<void> {
    // The same validator (`membershipIdValidator`) also requires a `role`
    // body field here, even though `leaveOrganizationService` never reads
    // it — see the note above `remove()`.
    await api.post(`/api/v1/members/organization/${orgId}/leave`, {
      role: "member",
    });
  },
};
