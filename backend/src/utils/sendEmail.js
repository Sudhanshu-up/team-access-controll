import { transporter } from "../config/mail.config.js";

export const sendEmail = async ({
    to,
    subject,
    html,
}) => {

    const info = await transporter.sendMail({
        from: `"Team Access Control" <${process.env.MAIL_USER}>`,
        to,
        subject,
        html,
    });

    return info;
};