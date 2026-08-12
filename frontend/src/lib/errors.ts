import { isAxiosError } from "axios";

/**
 * The TAC backend does not register a JSON error-handling middleware, so
 * errors thrown inside services (ApiError) fall through to Express's
 * default error handler, which responds with an HTML page (and, in dev
 * mode, a stack trace) instead of JSON — even though the HTTP status code
 * itself is correct. Validation errors and a few controller-level checks
 * (register/login) *do* return proper JSON. This helper normalizes both
 * cases into a single human-readable message, and specifically avoids
 * ever surfacing raw HTML/stack traces to the user.
 */

const STATUS_FALLBACK: Record<number, string> = {
  400: "That request wasn't valid. Please check the form and try again.",
  401: "You need to log in to continue.",
  403: "You don't have permission to do that.",
  404: "We couldn't find what you were looking for.",
  409: "This already exists or conflicts with something else.",
  422: "That request wasn't valid. Please check the form and try again.",
  500: "Something went wrong on the server. Please try again.",
};

function genericMessageForStatus(status?: number): string {
  if (status && STATUS_FALLBACK[status]) return STATUS_FALLBACK[status];
  if (!status) return "Network error. Please check your connection and try again.";
  return "Something went wrong. Please try again.";
}

interface ExpressValidatorError {
  msg?: string;
  message?: string;
  param?: string;
  path?: string;
}

export function parseApiError(error: unknown): {
  status?: number;
  message: string;
} {
  if (!isAxiosError(error)) {
    return { message: "An unexpected error occurred. Please try again." };
  }

  const status = error.response?.status;
  const data = error.response?.data;

  // No response at all -> network / CORS / server down.
  if (!error.response) {
    return { status, message: genericMessageForStatus(status) };
  }

  // JSON body (the happy path for validation errors and most controllers).
  if (data && typeof data === "object") {
    const body = data as {
      message?: string;
      errors?: ExpressValidatorError[] | unknown;
    };

    if (Array.isArray(body.errors) && body.errors.length > 0) {
      const first = body.errors[0] as ExpressValidatorError;
      const msg = first?.msg || first?.message;
      if (msg) return { status, message: msg };
    }

    if (typeof body.message === "string" && body.message.trim()) {
      return { status, message: body.message };
    }
  }

  // Anything else (HTML error page, empty string, etc.) — never show it raw.
  return { status, message: genericMessageForStatus(status) };
}
