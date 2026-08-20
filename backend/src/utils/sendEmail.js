// Sends email via Brevo's HTTPS API.

import ApiError from "../utils/ApiError.js";

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const response = await fetch(
      "https://api.brevo.com/v3/smtp/email",
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          "api-key": process.env.BREVO_API_KEY,
        },
        body: JSON.stringify({
          sender: {
            name: "Team Access Control",
            email: process.env.MAIL_USER,
          },
          to: [{ email: to }],
          subject,
          htmlContent: html,
        }),
      },
    );

    if (!response.ok) {
      const errorBody = await response.text();

      // Server-side logging only.
      console.error("Brevo API error:", {
        status: response.status,
        body: errorBody,
      });

      if (response.status === 401) {
        throw new ApiError(
          500,
          "Email service authentication is not configured correctly.",
        );
      }

      if (response.status === 403) {
        throw new ApiError(
          502,
          "Email service rejected the request.",
        );
      }

      if (response.status === 429) {
        throw new ApiError(
          503,
          "Email service rate limit reached. Please try again later.",
        );
      }

      if (response.status >= 500) {
        throw new ApiError(
          503,
          "Email service is temporarily unavailable.",
        );
      }

      throw new ApiError(
        502,
        "Unable to send email.",
      );
    }

    return await response.json();
  } catch (error) {
    // Don't convert our own ApiError again.
    if (error instanceof ApiError) {
      throw error;
    }

    console.error("Email service request failed:", error);

    throw new ApiError(
      503,
      "Email service is currently unavailable.",
    );
  }
};