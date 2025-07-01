import { jwtDecode } from "jwt-decode";

/**
 * Extracts the user ID from a JWT token.
 *
 * Decodes the provided JWT token and attempts to retrieve the user ID,
 * typically stored in the `sub` (subject) claim of the token payload.
 *
 * @param token - The JWT token string to decode.
 * @returns The user ID as a string if present, or `null` if the token is invalid or the user ID is not found.
 */
export function getUserIdFromToken(token: string): string | null {
  try {
    const decoded: any = jwtDecode(token);
    console.log("Decoded Token:", decoded);
    return decoded.sub || null; // usually 'sub' contains the user ID
  } catch (err) {
    console.error("Invalid token", err);
    return null;
  }
}