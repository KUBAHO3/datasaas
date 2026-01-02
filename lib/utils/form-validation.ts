import { Form } from "@/lib/types/form-types";

/**
 * Check if a form has expired based on its expiresAt date
 */
export function isFormExpired(form: Form): boolean {
    if (!form.accessControl.expiresAt) {
        return false;
    }

    const expiryDate = new Date(form.accessControl.expiresAt);
    const now = new Date();

    return expiryDate < now;
}

/**
 * Check if a form can accept new submissions
 * Returns an object with canAccept boolean and optional reason for rejection
 */
export function canAcceptSubmissions(
    form: Form,
    currentSubmissionCount?: number
): { canAccept: boolean; reason?: string } {
    if (form.status !== "published") {
        return {
            canAccept: false,
            reason: `This form is currently ${form.status}. Only published forms can accept submissions.`,
        };
    }

    if (isFormExpired(form)) {
        const expiryDate = new Date(form.accessControl.expiresAt!);
        return {
            canAccept: false,
            reason: `This form expired on ${expiryDate.toLocaleString()}. It is no longer accepting submissions.`,
        };
    }

    if (
        form.accessControl.maxSubmissions !== undefined &&
        currentSubmissionCount !== undefined &&
        currentSubmissionCount >= form.accessControl.maxSubmissions
    ) {
        return {
            canAccept: false,
            reason: `This form has reached its maximum limit of ${form.accessControl.maxSubmissions} submissions.`,
        };
    }

    return { canAccept: true };
}

/**
 * Get expiry status information for display purposes
 */
export function getExpiryStatus(form: Form): {
    hasExpiry: boolean;
    isExpired: boolean;
    expiryDate?: Date;
    message?: string;
} {
    if (!form.accessControl.expiresAt) {
        return { hasExpiry: false, isExpired: false };
    }

    const expiryDate = new Date(form.accessControl.expiresAt);
    const now = new Date();
    const isExpired = expiryDate < now;

    if (isExpired) {
        return {
            hasExpiry: true,
            isExpired: true,
            expiryDate,
            message: `Expired on ${expiryDate.toLocaleDateString()}`,
        };
    }

    // Calculate time remaining
    const daysRemaining = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    let message: string;
    if (daysRemaining === 0) {
        message = "Expires today";
    } else if (daysRemaining === 1) {
        message = "Expires tomorrow";
    } else if (daysRemaining <= 7) {
        message = `Expires in ${daysRemaining} days`;
    } else if (daysRemaining <= 30) {
        message = `Expires in ${Math.ceil(daysRemaining / 7)} weeks`;
    } else {
        message = `Expires on ${expiryDate.toLocaleDateString()}`;
    }

    return {
        hasExpiry: true,
        isExpired: false,
        expiryDate,
        message,
    };
}

/**
 * Validate form has required fields before publishing
 */
export function validateFormForPublishing(form: Form): {
    isValid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    // Check if form has at least one field
    if (form.fields.length === 0) {
        errors.push("Form must have at least one field");
    }

    // Check if form has a name
    if (!form.name || form.name.trim() === "") {
        errors.push("Form must have a name");
    }

    // Check if required fields are properly configured
    const invalidFields = form.fields.filter((field) => {
        // Check if field has a label
        if (!field.label || field.label.trim() === "") {
            return true;
        }
        return false;
    });

    if (invalidFields.length > 0) {
        errors.push(`${invalidFields.length} field(s) are missing labels`);
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}
