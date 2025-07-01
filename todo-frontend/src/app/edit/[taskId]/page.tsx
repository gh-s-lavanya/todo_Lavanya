// ✅ EditTaskPage.tsx (with fixed time issue & clean messages)
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "../../utils/axiosInstance";
import { getUserIdFromToken } from "../../utils/getUserIdFromToken";
import SideMenu from "../../components/SideMenu";

export default function EditTaskPage() {
  const router = useRouter();
  const { taskId } = useParams();
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState<number | null>(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const getToday = () => new Date().toISOString().split("T")[0];
  const getNow = () => new Date().toTimeString().slice(0, 5);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await axios.get(`/todo/${taskId}`);
        const t = res.data;
        setTask(t);
        setTitle(t.title || "");
        setCategory(t.category || "");
        setPriority(t.priority ?? 0);
        setIsCompleted(t.isCompleted || false);

        if (t.dueDate) {
          const date = new Date(t.dueDate);
          setDueDate(date.toISOString().split("T")[0]);
          setDueTime(date.toTimeString().slice(0, 5));
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching task", err);
        setMessage("Failed to load task");
        setIsSuccess(false);
        setLoading(false);
      }
    };
    fetchTask();
  }, [taskId]);

  const handleUpdate = async () => {
    const now = new Date();
    const selectedDateTime = dueDate ? new Date(`${dueDate}T${dueTime || "00:00"}`) : null;

    if (!title.trim()) {
      setMessage("Title is required");
      setIsSuccess(false);
      return;
    }
    if (!category.trim()) {
      setMessage("Category is required");
      setIsSuccess(false);
      return;
    }
    if (!dueDate) {
      setMessage("Due date is required");
      setIsSuccess(false);
      return;
    }
    if (selectedDateTime && selectedDateTime < now) {
      setMessage("Due date/time cannot be in the past");
      setIsSuccess(false);
      return;
    }

    const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
    if (!token) {
      setMessage("You must be logged in to update the task.");
      setIsSuccess(false);
      return;
    }

    const userId = getUserIdFromToken(token);
    if (!userId) {
      setMessage("Could not extract user ID from token.");
      setIsSuccess(false);
      return;
    }

    const dueDateTime = dueDate && dueTime ? `${dueDate}T${dueTime}:00` : undefined;

    const updateData = {
      id: parseInt(taskId as string),
      title,
      dueDate: dueDateTime,
      category,
      isCompleted,
      priority,
      userId,
      position: task?.position ?? 0,
    };

    try {
      await axios.put(`/todo/${taskId}`, updateData);
      setMessage("Task updated successfully");
      setIsSuccess(true);
      setTimeout(() => router.push("/"), 1000);
    } catch (err) {
      console.error("Update failed", err);
      setMessage("Failed to update task");
      setIsSuccess(false);
    }
  };

  if (loading) return <div className="p-6 text-center">Loading task...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 text-black p-4">
      <SideMenu />
      <div className="flex-grow pt-20 p-6 flex flex-col items-center justify-center">
        <div className="bg-gradient-to-br from-pink-200 to-purple-200 rounded-xl shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4 text-center">Edit Task</h2>

          {message && (
            <p className={`text-center mb-4 font-semibold ${isSuccess ? "text-green-600" : "text-red-600"}`}>{message}</p>
          )}

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
              value={priority || 0}
              onChange={(e) => setPriority(parseInt(e.target.value))}
            >
              <option value={0}>Select Priority (1 - Low, 5 - High)</option>
              {[1, 2, 3, 4, 5].map((p) => (
                <option key={p} value={p}>{`Priority ${p}`}</option>
              ))}
            </select>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isCompleted}
                onChange={() => setIsCompleted(!isCompleted)}
              />
              <span>Completed</span>
            </label>
            <button
              onClick={handleUpdate}
              className="w-full mt-2 bg-green-500 text-white py-2 rounded hover:bg-green-600"
            >
              💾 Update Task
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
