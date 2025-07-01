// components/SideMenu.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * SideMenu component renders a responsive sidebar menu for navigation.
 *
 * Features:
 * - Hamburger button toggles the visibility of the side menu.
 * - Menu options for Home, Add Task, My Profile, and Logout.
 * - Logout clears local and session storage, then redirects to the login page.
 * - Clicking outside the menu closes it.
 *
 * Uses Next.js router for navigation and React state for menu visibility.
 *
 * @component
 */
export default function SideMenu() {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

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
