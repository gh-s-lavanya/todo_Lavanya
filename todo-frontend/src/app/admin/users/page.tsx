"use client";

import { useEffect, useState } from "react";
import { getToken } from "../../utils/auth";
import { useRouter } from "next/navigation";
import AdminUserCard from "../../components/AdminUserCard";
import axios from "axios";

interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
}

/**
 * Renders a page displaying all users for the admin panel.
 *
 * Fetches the list of users from the backend API on mount and displays each user
 * using the `AdminUserCard` component.
 *
 * @component
 *
 * @returns {JSX.Element} The rendered All Users admin page.
 */
export default function AllUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = getToken();
        const res = await axios.get("http://localhost:5000/api/account/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(res.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">All Users</h1>
      <div className="grid gap-4">
        {users.map((user) => (
          <AdminUserCard
            key={user.id}
            id={user.id}
            name={user.name}
            email={user.email}
            phoneNumber={user.phoneNumber}
          />
        ))}
      </div>
    </div>
  );
}
