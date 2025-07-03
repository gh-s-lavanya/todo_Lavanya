"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "../../utils/axiosInstance";
import Adminmenu from "../../components/Adminmenu";

/**
 * Renders the admin page displaying a list of tasks for a specific user.
 * 
 * - Fetches tasks and user information based on the `userId` from the URL search parameters.
 * - Allows admin to view, and (if assigned by admin) delete tasks for the user.
 * - Displays loading and error states.
 * - Includes a back button to return to the previous page.
 * 
 * @component
 * @returns {JSX.Element} The rendered user tasks list page for admin.
 */
export default function UserTasksListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");

  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
// Fetch tasks and user information when the component mounts or when `userId` changes
  useEffect(() => {
    if (!userId) return;

    const fetchTasks = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/todo/user/${userId}`);
        setTasks(res.data.tasks || res.data);
        setUserName(res.data.userName || "User");
      } catch (err) {
        console.error("Failed to fetch user tasks", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [userId]);
// Handle task deletion
  const handleDelete = async (taskId: number) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/todo/${taskId}`);
      setTasks(tasks.filter((t) => t.id !== taskId));
    } catch (err) {
      console.error("Failed to delete task", err);
      alert("Error deleting task");
    }
  };

  if (!userId) return <p className="text-red-600 font-semibold">Invalid user ID</p>;
  if (loading) return <p className="text-gray-600 text-lg">Loading...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 text-black p-4">
      <Adminmenu />

      <div className="max-w-4xl mx-auto mt-6">
        {/* Header with Back button */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Tasks for {userName}</h1>
          <button
            onClick={() => router.back()}
            className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
          >
            ⬅ Back
          </button>
        </div>

        {tasks.length === 0 ? (
          <p className="text-gray-700 text-lg text-center">No tasks found for this user.</p>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-2xl shadow-md px-6 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center transition-all hover:shadow-lg"
              >
                <div className="mb-2 sm:mb-0">
                  <h2 className="text-lg font-semibold text-purple-700">{task.title}</h2>
                  <p className="text-sm text-gray-600">{task.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-500">Category: {task.category}</p>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-2 sm:mt-0">
                  {/* Status */}
                  {task.isCompleted ? (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full shadow-sm">
                      ✅ Completed
                    </span>
                  ) : (
                    <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full shadow-sm">
                      ❌ Incomplete
                    </span>
                  )}

                  {/* Delete button for admin-assigned tasks */}
                  {task.assignedBy && (
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
