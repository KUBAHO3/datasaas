/**
 * Utility functions for user profiles
 */

/**
 * Generate a profile link for a user
 * @param userId - The user's ID
 * @returns The profile URL path
 */
export function getProfileLink(userId: string): string {
  return `/dashboard/profile/${userId}`;
}

/**
 * Generate a link component-friendly object for user profile
 * @param userId - The user's ID
 * @param userName - Optional user name for display
 * @returns Object with href and display info
 */
export function getProfileLinkData(userId: string, userName?: string) {
  return {
    href: getProfileLink(userId),
    label: userName || "View Profile",
  };
}

/**
 * Get user initials from name
 * @param name - User's full name
 * @returns Initials (max 2 characters)
 */
export function getUserInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
