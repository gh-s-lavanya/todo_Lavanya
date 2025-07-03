"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { getToken } from "../utils/auth";
import { jwtDecode } from "jwt-decode";
import axios from "../utils/axiosInstance";
import { useRouter } from "next/navigation";
import Adminmenu from "../components/Adminmenu";
import { FaEye, FaPlus } from "react-icons/fa";

/**
 * AdminDashboardPage component displays the admin dashboard interface.
 *
 * - Fetches and displays the admin's name from a JWT token.
 * - Retrieves and lists all registered users except the main admin.
 * - Provides action buttons for each user to view details, view tasks, or assign tasks.
 * - Uses Tailwind CSS for styling and layout.
 *
 * @component
 * @returns {JSX.Element} The rendered admin dashboard page.
 */
const AdminDashboardPage = () => {
  const [adminName, setAdminName] = useState<string>("Admin");
  const [users, setUsers] = useState([]);
  const router = useRouter();
// Effect to fetch admin name from JWT token
  useEffect(() => {
    const token = getToken();
    if (token) {
      const decoded: any = jwtDecode(token);
      setAdminName(decoded.name || "Admin");
    }
  }, []);
// Effect to fetch users from the API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/account/users");
        setUsers(response.data.filter((user: any) => user.email !== "admin@gmail.com"));
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };
    fetchUsers();
  }, []);

  return (
  <div className="min-h-screen bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 text-black p-4">
    <Adminmenu />
    <div className="flex-1 p-6">
      <h1 className="text-2xl font-bold text-center mb-6">Welcome, {adminName}</h1>

      <h2 className="mt-8 text-xl font-semibold text-center">Registered Users</h2>
      <div className="mt-6 space-y-4 max-w-3xl mx-auto">
        {users.map((user: any) => (
          <div
            key={user.id}
            className="bg-white rounded-xl shadow-lg px-6 py-4 flex justify-between items-center"
          >
            <div>
              <h3 className="text-lg font-semibold">{user.name}</h3>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push(`/admin/users/details?userId=${user.id}`)}
                className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
              >
                Details
              </button>
              <button
                onClick={() => router.push(`/admin/tasks?userId=${user.id}`)}
                className="flex items-center gap-1 bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
              >
                <FaEye className="text-sm" />
                View Tasks
              </button>
              <button
                onClick={() => router.push(`/admin/assign?userId=${user.id}`)}
                className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
              >
                <FaPlus className="text-sm" />
                Assign
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
}
export default AdminDashboardPage;

