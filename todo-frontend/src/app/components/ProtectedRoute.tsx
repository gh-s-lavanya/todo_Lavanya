"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "../utils/auth";

/**
 * A React component that protects routes by checking for a valid authentication token.
 * If the token is missing or invalid, the user is redirected to the login page.
 * While the authentication status is being determined, a loading message is displayed.
 *
 * @param children - The child components to render if the user is authenticated.
 * @returns The protected children components or a loading indicator.
 */
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
  try {
    const token = getToken();
    if (!token) {
      router.push("/login");
    } else {
      setLoading(false);
    }
  } catch (err) { // temporarily catch any errors
    console.error("Token check failed", err);
    router.push("/login");
  } finally {
    setLoading(false);
  }
}, [router]);


  if (loading) return <p className="text-center p-4">Loading...</p>;

  return <>{children}</>;
}
