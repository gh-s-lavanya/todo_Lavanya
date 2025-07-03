"use client";

import { use, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "../../utils/axiosInstance";
import Adminmenu from "../../components/Adminmenu";
import { useRouter } from "next/navigation";

/**
 * Renders the Assign Task page for administrators to assign tasks to users.
 *
 * This component fetches the list of users from the backend and allows the admin
 * to assign a new task to a selected user. If a `pageUserId` is provided in the URL
 * search parameters, the user selection is prefilled and disabled.
 *
 * Features:
 * - Fetches and displays a list of users for task assignment.
 * - Allows input of task title, description, category, due date, due time, and priority.
 * - Submits the task assignment to the backend API.
 * - Displays success or error messages upon submission.
 * - Provides a back button to return to the previous page.
 *
 * @component
 * @returns {JSX.Element} The Assign Task page UI.
 */
export default function AssignTaskPage() {
  const searchParams = useSearchParams();
  const prefilledUserId = searchParams.get("pageUserId");

  const [users, setUsers] = useState([]);
  const [userId, setUserId] = useState(prefilledUserId || "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General");
  const [priority, setPriority] = useState(1);
  const [dueDate, setDueDate] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();
// Fetch users when the component mounts or when prefilledUserId changes
  useEffect(() => {
    axios.get(`http://localhost:5000/api/account/users`).then((res) => {
      setUsers(res.data);
    });
  }, []);
// Handle form submission to assign a task
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:5000/api/todo/assign/${userId}`, {
        title,
        description,
        category,
        priority,
        dueDate: dueDate || new Date().toISOString(),
        isCompleted: false,
      });
      setMessage("✅ Task assigned successfully!");
      setTitle("");
      setDescription("");
      setCategory("General");
      setPriority(1);
      setDueDate("");
    } catch (error) {
      console.error("Assignment error", error);
      setMessage("❌ Failed to assign task");
    }
  };

  useEffect(() => {
  axios.get("http://localhost:5000/api/account/users").then((res) => {
    setUsers(res.data);

    // Prefill name if pageUserId is passed
    if (prefilledUserId) {
      setUserId(prefilledUserId);
    }
  });
}, []);
return (
  <div className="min-h-screen bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 text-black p-8">
    <Adminmenu />
    <div className="absolute top-6 right-6 z-10">
      <button
        onClick={() => router.back()}
        className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800 shadow"
      >
        ⬅ Back
      </button>
    </div>
    <main className="flex justify-center mt-6">
      <div className="w-full max-w-3xl bg-white p-6 rounded-2xl shadow-xl">
        <div className="flex justify-between items-center mb-6">
          
          <h1 className="text-3xl font-bold text-pink-600">Assign Task</h1>
          <h2 className="text-lg font-semibold text-gray-600">Fill out the details</h2>
        </div>

        <div className="bg-gradient-to-br from-pink-200 via-purple-200 to-pink-100 p-6 rounded-xl shadow-inner">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* User + Task Title */}
            <div className="grid grid-cols-2 gap-4">
              <div>
            <label className="block mb-1 font-medium">User</label>
            <select
              className="w-full border p-2 rounded bg-gray-100"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              disabled={!!prefilledUserId}
              required
            >
              <option value="">-- Select a user --</option>
              {users.map((user: any) => (
                <option key={user.id} value={user.id}>
                  {user.name || user.email}
                </option>
              ))}
            </select>
          </div>

              <div>
                <label className="block mb-1 font-semibold text-gray-800">Task Title</label>
                <input
                  type="text"
                  className="w-full border p-2 rounded"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Description + Category */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-semibold text-gray-800">Description</label>
                <textarea
                  className="w-full border p-2 rounded"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-800">Category</label>
                <input
                  type="text"
                  className="w-full border p-2 rounded"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>
            </div>

            {/* Due Date + Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-semibold text-gray-800">Due Date</label>
                <input
                  type="date"
                  className="w-full border p-2 rounded"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold text-gray-800">Due Time</label>
                <input
                  type="time"
                  className="w-full border p-2 rounded"
                  // Add onChange if you plan to store time separately
                />
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block mb-1 font-semibold text-gray-800">Priority (1–5)</label>
              <input
                type="number"
                className="w-full border p-2 rounded"
                value={priority}
                onChange={(e) => setPriority(parseInt(e.target.value))}
                min={1}
                max={5}
              />
            </div>

            {/* Submit */}
            <div className="text-center">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
              >
                Assign Task
              </button>
            </div>
          </form>

          {message && (
            <p className="mt-4 text-sm text-center font-medium text-green-600">{message}</p>
          )}
        </div>
      </div>
    </main>
  </div>
);
}
