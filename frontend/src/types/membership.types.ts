export type Role = "owner" | "admin" | "member" | "viewer";

/** The roles an existing member's role can be changed to (owner excluded). */
export const ASSIGNABLE_ROLES: Role[] = ["admin", "member", "viewer"];

export interface Member {
  _id: string; // membership id
  role: Role;
  invitedBy: string | null;
  joinedAt: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
}
