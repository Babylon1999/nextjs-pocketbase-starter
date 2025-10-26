/**
 * Utility functions for extracting and formatting PocketBase error messages
 */

export interface PocketBaseErrorData {
  status?: number;
  message?: string;
  data?: {
    [key: string]: {
      code?: string;
      message?: string;
    };
  };
}

/**
 * Extracts the most relevant error message from PocketBase error response
 * @param errorData - The error response from PocketBase
 * @param defaultMessage - Default message to use if no specific error is found
 * @returns The most specific error message available
 */
export function extractPocketBaseErrorMessage(
  errorData: PocketBaseErrorData | null,
  defaultMessage: string = "An error occurred. Please try again."
): string {
  if (!errorData) {
    return defaultMessage;
  }

  // Handle network errors first
  if (
    errorData?.message?.includes("Failed to fetch") ||
    (errorData as any)?.name === "TypeError"
  ) {
    return "Network error: Unable to connect to the server. Please check your internet connection and try again.";
  }

  // Handle authentication errors specifically
  if (
    errorData.status === 400 &&
    errorData.message?.includes("Failed to authenticate")
  ) {
    // Extract field-specific validation errors for authentication
    if (errorData.data) {
      const fieldErrors = Object.entries(errorData.data);
      for (const [field, error] of fieldErrors) {
        if (error?.message) {
          const formattedField = formatFieldName(field);
          return `${formattedField}: ${error.message}`;
        }
      }
    }
    return "Authentication failed. Please check your credentials and try again.";
  }

  // Handle server errors
  if (errorData.status && errorData.status >= 500) {
    return "Server error: Please try again later.";
  }

  // First, check for field-specific validation errors
  if (errorData.data) {
    const fieldErrors = Object.entries(errorData.data);

    // Return the first field error message found
    for (const [field, error] of fieldErrors) {
      if (error?.message) {
        // Format the field name for better readability
        const formattedField = formatFieldName(field);
        return `${formattedField}: ${error.message}`;
      }
    }
  }

  // Fall back to the main error message
  if (errorData.message) {
    // Clean up common PocketBase error messages
    return cleanErrorMessage(errorData.message);
  }

  // Final fallback
  return defaultMessage;
}

/**
 * Formats field names for better readability
 * @param field - The field name from PocketBase
 * @returns Formatted field name
 */
function formatFieldName(field: string): string {
  const fieldMap: { [key: string]: string } = {
    identity: "Email or username",
    email: "Email",
    password: "Password",
    passwordConfirm: "Password confirmation",
    name: "Name",
    otpId: "OTP ID",
    token: "Token",
    oldPassword: "Current password",
    newPassword: "New password",
  };

  return fieldMap[field] || field.charAt(0).toUpperCase() + field.slice(1);
}

/**
 * Cleans up common PocketBase error messages for better user experience
 * @param message - The raw error message
 * @returns Cleaned error message
 */
function cleanErrorMessage(message: string): string {
  const cleanMap: { [key: string]: string } = {
    "Failed to authenticate.":
      "Authentication failed. Please check your credentials.",
    "Failed to create record.": "Failed to create account. Please try again.",
    "Failed to update record.": "Failed to update. Please try again.",
    "Failed to delete record.": "Failed to delete. Please try again.",
    "Invalid credentials.": "Invalid email or password. Please try again.",
    "Something went wrong while processing your request.":
      "An unexpected error occurred. Please try again.",
  };

  return cleanMap[message] || message;
}
