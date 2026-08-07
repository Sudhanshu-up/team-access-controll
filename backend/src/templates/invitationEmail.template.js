

export const invitationTemplate = ({
    organizationName,
    invitedBy,
    invitationLink,
    rejectInvitationLink,
}) => {

    return `
        <div style="font-family:Arial,sans-serif">

            <h2>You're Invited 🎉</h2>

            <p>
                <strong>${invitedBy}</strong>
                invited you to join
                <strong>${organizationName}</strong>.
            </p>

            <a
                href="${invitationLink}"
                style="
                    display:inline-block;
                    padding:12px 20px;
                    background:#2563eb;
                    color:white;
                    text-decoration:none;
                    border-radius:6px;
                "
            >
                Accept Invitation
            </a>

            <a
                href="${rejectInvitationLink}"
                style="
                    display:inline-block;
                    padding:12px 20px;
                    background:#2563eb;
                    color:white;
                    text-decoration:none;
                    border-radius:6px;
                "
            >
                Reject Invitation
            </a>

            <p>
                This invitation expires in 24 hours.
            </p>

        </div>
    `;
};