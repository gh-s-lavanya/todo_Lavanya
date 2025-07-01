"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "../utils/axiosInstance";


/**
 * RegisterPage component renders a registration form for new users.
 *
 * Features:
 * - Collects user's name, email, password, and password confirmation.
 * - Validates that password and confirmation match before submitting.
 * - Sends registration data to the backend API endpoint.
 * - Displays error messages for failed registration or validation errors.
 * - Redirects to the login page upon successful registration.
 * - Provides a link to the login page for existing users.
 *
 * UI:
 * - Styled with Tailwind CSS for a modern, responsive look.
 *
 * Dependencies:
 * - React hooks: useState, useRouter (from Next.js).
 * - axios for HTTP requests.
 */
export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const router = useRouter();

  const handleRegister = async () => {
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    try {              // change the url to http://192.168.x.x:5000/api/account/register if you are on a mobile device.
      await axios.post("/account/register", {
        name,
        email,
        password,
      });

      setSuccess("Registered successfully!");
      setTimeout(() => router.push("/login"), 1500);
    } catch (err: any) {
      console.error(err);
      const message = err.response?.data || "Registration failed";
      setError(typeof message === "string" ? message : JSON.stringify(message));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 text-black p-8">
      <div className="max-w-md mx-auto bg-gradient-to-br from-pink-200 to-purple-300 p-6 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center">Register</h1>

        <input
          type="text"
          placeholder="Name"
          className="w-full p-3 border rounded mb-4"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 border rounded mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 border rounded mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirm Password"
          className="w-full p-3 border rounded mb-4"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />

        <button
          onClick={handleRegister}
          className="w-full bg-green-500 text-white py-3 rounded hover:bg-green-600"
        >
          Register
        </button>

        {success && <p className="text-green-600 mt-4 text-center">{success}</p>}
        {error && <p className="text-red-600 mt-4 text-center">{error}</p>}

        <p className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
