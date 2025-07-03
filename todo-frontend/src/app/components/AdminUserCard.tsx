"use client";

import { useRouter } from "next/navigation";

interface AdminUserCardProps {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
}

/**
 * Renders a card displaying user information for admin management.
 *
 * @param id - The unique identifier of the user.
 * @param name - The name of the user.
 * @param email - The email address of the user.
 * @param phoneNumber - The phone number of the user (optional).
 *
 * Provides action buttons for viewing tasks, assigning tasks, and promoting the user.
 */
export default function AdminUserCard({
  id,
  name,
  email,
  phoneNumber,
}: AdminUserCardProps) {
  const router = useRouter();

  return (
    <div className="rounded-xl border p-4 shadow-md bg-white hover:shadow-lg transition-all">
      <h2 className="text-lg font-semibold text-gray-800">{name}</h2>
      <p className="text-sm text-gray-600">{email}</p>
      <p className="text-sm text-gray-600">{phoneNumber || "N/A"}</p>

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => router.push(`/admin/users/${id}/tasks`)}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
        >
          View Tasks
        </button>
        <button
          onClick={() => router.push(`/admin/assign?page=user&id=${id}`)}
          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
        >
          Assign Task
        </button>
        <button
          onClick={() => router.push(`/admin/promote?page=user&id=${id}`)}
          className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
        >
          Promote
        </button>
      </div>
    </div>
  );
}
