export type InvitationRole = "admin" | "member" | "viewer";
export type InvitationStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "expired"
  | "cancelled";

export interface InvitePayload {
  email: string;
  role: InvitationRole;
}

export interface Invitation {
  _id: string;
  email: string;
  organizationId: {
    _id: string;
    name: string;
    isActive: boolean;
  };
  role?: InvitationRole;
  status: InvitationStatus;
  expiresAt: string;
  isActive: boolean;
  acceptedAt?: string | null;
  rejectedAt?: string | null;
  /** Sirf invite/resend response me aata hai — false matlab email fail hua. */
  emailSent?: boolean;
}