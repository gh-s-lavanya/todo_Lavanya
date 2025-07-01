"use client";

import { useEffect, useState } from "react";
import axios from "../utils/axiosInstance";
import SideMenu from "../components/SideMenu";
import ProtectedRoute from "../components/ProtectedRoute";
import { getUserIdFromToken } from "../utils/getUserIdFromToken";
import { getToken } from "../utils/auth";

interface TodoItem {
  id: number;
  title: string;
  isCompleted: boolean;
  dueDate?: string;
}

/**
 * ProfilePage component displays the user's profile information and statistics about their todos.
 *
 * - Fetches user profile and todo data on mount using the stored authentication token.
 * - Allows the user to view and edit their name, phone number, and password.
 * - Displays the user's email (read-only).
 * - Shows statistics for completed and uncompleted tasks.
 * - Handles loading and error states.
 * - Requires authentication (wrapped in ProtectedRoute).
 *
 * @component
 * @returns {JSX.Element} The rendered profile page.
 */
export default function ProfilePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    const userId = token ? getUserIdFromToken(token) : null;

    if (!token || !userId) {
      setError("Unauthorized");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [userRes, todosRes] = await Promise.all([ // change the url to http://192.168.x.x:5000/api/account/me if you are on a mobile device.
          axios.get("/account/me", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("/todo", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const user = userRes.data;
        setName(user.name || "");
        setEmail(user.email || "");
        setPhoneNumber(user.phoneNumber || "");
        setTodos(todosRes.data || []);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSave = async () => {
    try {
      const token = getToken();

      await axios.put(
        "/account/me",
        {
          name,
          phoneNumber,
          password: password || null,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Changes saved!");
      setIsEditing(false);
      setPassword("");
    } catch (err) {
      alert("Failed to save changes.");
      console.error(err);
    }
  };

  const completedCount = todos.filter((t) => t.isCompleted).length;
  const uncompletedCount = todos.length - completedCount;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 text-black flex">
        <SideMenu />
        <div className="flex-grow pt-20 p-6">
          <div className="max-w-2xl mx-auto bg-gradient-to-br from-pink-200 to-purple-200 shadow-2xl rounded-2xl p-6 space-y-6">
            <h1 className="text-3xl font-bold text-center">Profile</h1>

            {loading ? (
              <p className="text-center">Loading...</p>
            ) : error ? (
              <p className="text-center text-red-600">{error}</p>
            ) : (
              <>
                <div className="space-y-3">
                  <div>
                    <label className="font-semibold">Name:</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full mt-1 p-2 border rounded"
                      />
                    ) : (
                      <p>{name}</p>
                    )}
                  </div>

                  <div>
                    <label className="font-semibold">Email:</label>
                    <p>{email}</p>
                  </div>

                  <div>
                    <label className="font-semibold">Mobile Number:</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full mt-1 p-2 border rounded"
                      />
                    ) : (
                      <p>{phoneNumber || "📱 Not provided yet"}</p>
                    )}
                  </div>

                  <div>
                    <label className="font-semibold">Password:</label>
                    {isEditing ? (
                      <input
                        type="password"
                        value={password}
                        placeholder="Enter new password"
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full mt-1 p-2 border rounded"
                      />
                    ) : (
                      <p>********</p>
                    )}
                  </div>
                </div>

                <div className="text-center">
                  {isEditing ? (
                    <button
                      onClick={handleSave}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Edit
                    </button>
                  )}
                </div>

                <hr />

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-blue-100 p-4 rounded-xl shadow">
                    <p className="text-xl font-bold">{completedCount}</p>
                    <p>Completed Tasks</p>
                  </div>
                  <div className="bg-yellow-100 p-4 rounded-xl shadow">
                    <p className="text-xl font-bold">{uncompletedCount}</p>
                    <p>Uncompleted Tasks</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
