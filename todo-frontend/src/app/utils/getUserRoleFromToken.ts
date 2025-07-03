// utils/getUserRoleFromToken.ts

import { jwtDecode } from "jwt-decode";

/**
 * Extracts the user's role from a JWT token.
 *
 * @param token - The JWT token string to decode.
 * @returns The user role as a string ("Admin" or "User"), or null if not found.
 */
export function getUserRoleFromToken(token: string): string | null {
  try {
    const decoded: any = jwtDecode(token);
    const roles = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    if (!roles) return null;

    // Role might be a single string or an array
    if (Array.isArray(roles)) {
      return roles.includes("Admin") ? "Admin" : roles[0];
    }

    return roles;
  } catch (err) {
    console.error("Invalid token while extracting role:", err);
    return null;
  }
}
