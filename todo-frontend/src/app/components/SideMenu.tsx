"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * SideMenu component renders a responsive sidebar menu with role-based options.
 */
/**
 * SideMenu component renders a responsive sidebar menu with navigation options.
 * 
 * - Displays a hamburger button to toggle the menu.
 * - Decodes a JWT from localStorage to determine the user's role.
 * - Shows navigation buttons for Home, Add Task, and My Profile.
 * - If the user has the "Admin" role, displays additional admin panel options:
 *   - View Users
 *   - Assign Tasks
 *   - Promote Users
 * - Provides a Logout button that clears local and session storage and redirects to the login page.
 * 
 * @component
 * @returns {JSX.Element} The rendered sidebar menu component.
 */
export default function SideMenu() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

  // Decode JWT and extract role
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split(".")[1]));
        const roleClaim =
          decoded[
            "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
          ];
        setRole(Array.isArray(roleClaim) ? roleClaim[0] : roleClaim);
      } catch (err) {
        console.error("Error decoding token:", err);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    router.push("/login");
  };

  return (
    <div className="fixed top-4 left-4 z-50">
      {/* Hamburger button */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="text-black text-3xl"
      >
        ☰
      </button>

      {menuOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 flex">
          <div className="bg-pink-100/80 backdrop-blur-md text-black w-64 p-6 shadow-xl rounded-r-2xl">
            <h2 className="text-xl font-bold mb-4">Menu</h2>

            <button
              onClick={() => router.push("/")}
              className="w-full bg-blue-500 text-white py-2 mb-4 rounded"
            >
              Home
            </button>

            <button
              onClick={() => router.push("/add-tasks")}
              className="w-full bg-green-500 text-white py-2 mb-4 rounded"
            >
              Add Task
            </button>

            <button
              onClick={() => router.push("/profile")}
              className="w-full bg-purple-500 text-white py-2 mb-4 rounded"
            >
              My Profile
            </button>

            {/* ✅ Admin-only buttons */}
            {role === "Admin" && (
              <>
                <div className="mt-6 mb-2 text-sm font-semibold text-gray-700">
                  Admin Panel
                </div>

                <button
                  onClick={() => router.push("/admin/users")}
                  className="w-full bg-yellow-500 text-white py-2 mb-3 rounded"
                >
                  View Users
                </button>

                <button
                  onClick={() => router.push("/admin/assign")}
                  className="w-full bg-yellow-500 text-white py-2 mb-3 rounded"
                >
                  Assign Tasks
                </button>

                <button
                  onClick={() => router.push("/admin/promote")}
                  className="w-full bg-yellow-500 text-white py-2 mb-3 rounded"
                >
                  Promote Users
                </button>
              </>
            )}

            <button
              onClick={handleLogout}
              className="w-full bg-gray-700 text-white py-2 rounded"
            >
              Logout
            </button>
          </div>
          <div className="flex-1" onClick={() => setMenuOpen(false)} />
        </div>
      )}
    </div>
  );
}
