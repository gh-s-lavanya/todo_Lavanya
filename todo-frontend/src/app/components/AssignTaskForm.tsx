"use client";

import { useState } from "react";

interface AssignTaskFormProps {
  onSubmit: (data: { title: string; description: string; dueDate: string }) => void;
  loading?: boolean;
}

/**
 * A form component for assigning a new task.
 *
 * @param onSubmit - Callback function invoked with the task details when the form is submitted.
 * @param loading - Boolean indicating whether the form is in a loading/submitting state.
 *
 * @remarks
 * - The form collects a title, description, and due date for the task.
 * - The title and due date fields are required.
 * - After successful submission, the form fields are reset.
 *
 * @example
 * ```tsx
 * <AssignTaskForm
 *   onSubmit={(task) => console.log(task)}
 *   loading={false}
 * />
 * ```
 */
export default function AssignTaskForm({ onSubmit, loading }: AssignTaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
// Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate.trim()) return;

    onSubmit({ title, description, dueDate });
    setTitle("");
    setDescription("");
    setDueDate("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-xl shadow-md space-y-4 w-full max-w-xl"
    >
      <h2 className="text-xl font-bold text-gray-800">Assign Task</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
        ></textarea>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Due Date</label>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-2 px-4 rounded text-white font-medium ${
          loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? "Assigning..." : "Assign Task"}
      </button>
    </form>
  );
}
