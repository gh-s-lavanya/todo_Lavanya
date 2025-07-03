import { jwtDecode } from "jwt-decode";

export interface DecodedToken {
  userId: string;
  email: string;
  name: string;
  roles: string[];
  exp: number;
}

/**
 * Decodes a JWT token and extracts user information such as user ID, email, name, roles, and expiration.
 *
 * @param token - The JWT token string to decode.
 * @returns An object containing the decoded user information (`userId`, `email`, `name`, `roles`, `exp`), or `null` if the token is invalid.
 *
 * @remarks
 * - The function expects the token to contain claims for user ID (`sub`), email, name, roles, and expiration (`exp`).
 * - The roles claim is extracted from the Microsoft-specific claim URI and normalized to an array.
 * - If decoding fails, the function logs an error and returns `null`.
 */
export function getUserIdFromToken(token: string): DecodedToken | null {
  try {
    const decoded: any = jwtDecode(token);

    const rolesClaim =
      decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

    const roles = Array.isArray(rolesClaim) ? rolesClaim : [rolesClaim];

    return {
      userId: decoded.sub,
      email: decoded.email,
      name: decoded.name,
      roles: roles,
      exp: decoded.exp,
    };
  } catch (err) {
    console.error("Invalid token", err);
    return null;
  }
}
