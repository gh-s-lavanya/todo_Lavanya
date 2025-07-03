"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "../../../utils/axiosInstance";
import Adminmenu from "../../../components/Adminmenu";
import { useRouter } from "next/navigation";

/**
 * Renders the user details page for the admin panel.
 *
 * This page fetches and displays detailed information about a specific user,
 * including their name, email, and mobile number. It also provides action buttons
 * for assigning tasks to the user and viewing the user's tasks.
 *
 * The user ID is retrieved from the URL search parameters (`userId`).
 * If the user data is not yet loaded, a loading indicator is shown.
 *
 * @component
 * @returns {JSX.Element} The rendered user details page.
 *
 * @example
 * // Usage in a Next.js route:
 * <UserDetailsPage />
 */
export default function UserDetailsPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("userId");
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
// Fetch user details when the component mounts or when `id` changes
  useEffect(() => {
    if (!id) return;

    const fetchUser = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/account/user/${id}`);
        setUser(res.data);
      } catch (err) {
        console.error("Error fetching user details:", err);
      }
    };

    fetchUser();
  }, [id]);

  if (!user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 text-black p-4 relative">
      <Adminmenu />

      {/* Top-right back button */}
      <div className="absolute top-6 right-6 z-10">
        <button
          onClick={() => router.back()}
          className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800 shadow"
        >
          ⬅ Back
        </button>
      </div>

      <div className="flex-1 p-6 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-purple-900 mb-6">👤 User Details</h1>

        <div className="bg-white p-6 rounded-2xl shadow-xl space-y-6">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Name</p>
            <div className="w-full bg-gradient-to-r from-pink-200 to-purple-200 p-3 rounded-lg text-gray-800 font-semibold shadow-sm">
              {user.name}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Email</p>
            <div className="w-full bg-gradient-to-r from-purple-200 to-blue-200 p-3 rounded-lg text-gray-800 font-semibold shadow-sm">
              {user.email}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Mobile</p>
            <div className="w-full bg-gradient-to-r from-blue-200 to-pink-200 p-3 rounded-lg text-gray-800 font-semibold shadow-sm">
              {user.phoneNumber || "N/A"}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mt-8">
          <Link
            href={`/admin/assign?pageUserId=${id}`}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-xl shadow"
          >
            ➕ Assign Task
          </Link>
          <Link
            href={`/admin/tasks?userId=${id}`}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-xl shadow"
          >
            View Tasks
          </Link>
        </div>
      </div>
    </div>
  );

}
