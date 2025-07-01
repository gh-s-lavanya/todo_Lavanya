export const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
};

export const getRefreshToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refreshToken") || sessionStorage.getItem("refreshToken");
};

/**
 * Stores the provided access and refresh tokens in either localStorage or sessionStorage
 * based on the user's preference to be remembered.
 *
 * @param access - The access token to be stored.
 * @param refresh - The refresh token to be stored.
 * @param remember - If true, tokens are stored in localStorage (persistent); 
 *                   if false, tokens are stored in sessionStorage (cleared on tab close).
 */
export const setTokens = (access: string, refresh: string, remember: boolean) => {
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem("accessToken", access);
  storage.setItem("refreshToken", refresh);
};

export const clearTokens = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  sessionStorage.removeItem("accessToken");
  sessionStorage.removeItem("refreshToken");
};
