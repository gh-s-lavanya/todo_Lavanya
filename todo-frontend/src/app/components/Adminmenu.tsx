"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "./ProtectedRoute";

/**
 * SideMenu component renders a protected side navigation menu for admin users.
 * 
 * Features:
 * - Displays a hamburger button to open the side menu.
 * - Shows a modal side drawer with navigation options when open.
 * - Decodes the user's role from a JWT token stored in localStorage.
 * - Provides navigation to the admin home page and a logout button.
 * - Handles logout by clearing local and session storage and redirecting to the login page.
 * - Uses a backdrop and click-away to close the menu.
 * 
 * Wrapped in a `ProtectedRoute` to ensure only authenticated users can access it.
 * 
 * @component
 */
export default function SideMenu() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();
// Decode the user's role from the JWT token when the component mounts
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split(".")[1]));
        const roleClaim = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
        setRole(Array.isArray(roleClaim) ? roleClaim[0] : roleClaim);
      } catch (err) {
        console.error("Error decoding token:", err);
      }
    }
  }, []);
// Handle logout by clearing storage and redirecting to login page
  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    router.push("/login");
  };

  return (
    <ProtectedRoute>
      {/* Fixed hamburger button */}
      <button
        onClick={() => setMenuOpen(true)}
        className="fixed top-4 left-4 text-black text-3xl z-50"
      >
        ☰
      </button>

      {/* Side Menu Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 flex"
          onClick={() => setMenuOpen(false)}
        >
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />

          {/* Drawer */}
          <div
            className="relative z-50 w-64 h-full bg-white/90 shadow-lg p-6 rounded-r-2xl"
            onClick={(e) => e.stopPropagation()} // Prevent click from closing menu
          >
            <h2 className="text-xl font-bold mb-6">Menu</h2>

            <button
              onClick={() => {
                router.push("/admin");
                setMenuOpen(false);
              }}
              className="w-full bg-blue-500 text-white py-2 mb-4 rounded"
            >
              Home
            </button>

            <button
              onClick={() => {
                handleLogout();
                setMenuOpen(false);
              }}
              className="w-full bg-red-500 text-white py-2 rounded"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
