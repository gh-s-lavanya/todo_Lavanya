// ✅ AddTaskPage.tsx (with validation)
"use client";

import { useState } from "react";
import axios from "../utils/axiosInstance";
import ProtectedRoute from "../components/ProtectedRoute";
import { useRouter } from "next/navigation";
import { getUserIdFromToken } from "../utils/getUserIdFromToken";
import SideMenu from "../components/SideMenu";

export default function AddTaskPage() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [priority, setPriority] = useState(0);
  const [message, setMessage] = useState("");

  const router = useRouter();

  const getToday = () => new Date().toISOString().split("T")[0];
  const getNow = () => new Date().toTimeString().slice(0, 5);

  const handleAdd = async () => {
    const now = new Date();
    const selectedDateTime = dueDate ? new Date(`${dueDate}T${dueTime || "00:00"}`) : null;

    if (!title.trim()) {
      setMessage("Title is required");
      return;
    }
    if (!category.trim()) {
      setMessage("Category is required");
      return;
    }
    if (!dueDate) {
      setMessage("Due date is required");
      return;
    }
    if (selectedDateTime && selectedDateTime < now) {
      setMessage("Due date/time cannot be in the past");
      return;
    }

    const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
    if (!token) {
      setMessage("You must be logged in to add a task.");
      return;
    }

    const userId = getUserIdFromToken(token);
    if (!userId) {
      setMessage("Could not extract user ID from token.");
      return;
    }

    const payload = {
      title,
      category,
      dueDate: dueDate && dueTime ? `${dueDate}T${dueTime}:00` : undefined,
      priority: priority > 0 ? priority : undefined,
      isCompleted: false,
      userId
    };

    try {
      await axios.post("/todo", payload);
      setMessage("Task added");
      setTimeout(() => router.push("/"), 1500);
    } catch (err) {
      console.error("Failed to add task", err);
      setMessage("Failed to add task");
    }
  };

  // Determine if the message is a success message
  const isSuccess = message === "Task added";

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 text-black flex">
        <SideMenu />
        <div className="flex-grow pt-24 p-6">
          <div className="max-w-3xl mx-auto bg-gradient-to-br from-pink-200 to-purple-300 p-6 rounded-2xl shadow-2xl">
            <h1 className="text-3xl font-bold mb-4 text-center">Add New Task</h1>
            <div className="bg-pink-200 p-6 rounded-xl shadow-inner space-y-4">
              <input
                type="text"
                placeholder="Title *"
                className="w-full p-3 border rounded"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <select
                className="w-full p-3 border rounded"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Select Category *</option>
                <option value="Work Tasks">Work Tasks</option>
                <option value="Personal Work">Personal Work</option>
                <option value="Health and Wellness">Health and Wellness</option>
                <option value="Family and Relationships">Family and Relationships</option>
                <option value="Learning">Learning</option>
                <option value="Household Chores">Household Chores</option>
                <option value="Hobbies">Hobbies</option>
                <option value="Financial Tasks">Financial Tasks</option>
              </select>
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="date"
                  className="w-full md:w-1/2 p-3 border rounded"
                  min={getToday()}
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
                <input
                  type="time"
                  className="w-full md:w-1/2 p-3 border rounded"
                  min={dueDate === getToday() ? getNow() : undefined}
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                />
              </div>
              <select
                className="w-full p-3 border rounded"
                value={priority}
                onChange={(e) => setPriority(parseInt(e.target.value))}
              >
                <option value={0}>Select Priority (1 - Low, 5 - High)</option>
                {[1, 2, 3, 4, 5].map((p) => (
                  <option key={p} value={p}>{`Priority ${p}`}</option>
                ))}
              </select>
              <button
                onClick={handleAdd}
                className="w-full bg-blue-500 text-white py-3 px-4 rounded hover:bg-blue-600 transition"
              >
                Add Task
              </button>
              {message && (
                <p className={`text-center font-semibold ${isSuccess ? "text-green-700" : "text-red-600"}`}>
    {message}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

// ✅ Let me know when you're ready for the updated EditTaskPage code.
