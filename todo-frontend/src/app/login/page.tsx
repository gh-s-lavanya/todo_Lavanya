"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "../utils/axiosInstance";

/**
 * LoginPage component provides a user interface for logging into the application.
 *
 * Features:
 * - Accepts user email and password input.
 * - Supports "Remember Me" functionality to persist credentials and tokens in localStorage.
 * - Handles login requests to the backend API and manages authentication tokens.
 * - Automatically redirects authenticated users to the home page.
 * - Displays error messages for invalid credentials.
 * - Pre-fills email and password fields if previously saved.
 *
 * @component
 * @returns {JSX.Element} The rendered login page.
 */
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    try {                          // change the url to http://192.168.x.x:5000/api/account/login if you are on a mobile device.
      const res = await axios.post("/account/login", {
        email,
        password,
      });
      console.log("Login response:", res.data);

      if (rememberMe) {
        localStorage.setItem("savedEmail", email);
        localStorage.setItem("savedPassword", password);
      }
       else 
       {
        localStorage.removeItem("savedEmail");
        localStorage.removeItem("savedPassword");
      }

      const accessToken = res.data.accessToken;
      const refreshToken = res.data.refreshToken;

      const storage = rememberMe ? localStorage : sessionStorage;

      storage.setItem("accessToken", accessToken);
      storage.setItem("refreshToken", refreshToken);
      console.log("Stored accessToken:", storage.getItem("accessToken")); //log to confirm

      router.push("/");
    } catch (err) {
      console.error(err);
      setError("Invalid credentials");
    }
  };

  //  Auto redirect if already logged in
  useEffect(() => {
    const token =
      localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
    if (token && token !== "undefined") {
      router.push("/");
    }
    const savedEmail = localStorage.getItem("savedEmail");
  const savedPassword = localStorage.getItem("savedPassword");

  if (savedEmail && savedPassword) {
    setEmail(savedEmail);
    setPassword(savedPassword);
    setRememberMe(true);
  }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 text-black p-8">
      <div className="max-w-md mx-auto bg-gradient-to-br from-pink-200 to-purple-200 p-6 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center">Login</h1>

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

        <label className="flex items-center text-sm mb-4">
          <input
            type="checkbox"
            className="mr-2"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          Remember Me
        </label>

        <button
          onClick={handleLogin}
          className="w-full bg-blue-500 text-white py-3 rounded hover:bg-blue-600"
        >
          Login
        </button>

        {error && <p className="text-red-600 mt-4 text-center">{error}</p>}

        <p className="mt-4 text-center text-sm">
          Don't have an account?{" "}
          <a href="/register" className="text-blue-600 underline">
            Register
          </a>
        </p>
      </div>
    </div>
  );
}
