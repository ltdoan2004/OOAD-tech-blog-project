"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from '@/src/context/AuthContext';

// Schema validation for forms
const loginSchema = z.object({
  email: z.string().min(1, "Please enter an email").email("Invalid email"),
  password: z.string().min(1, "Please enter a password"),
});

const registerSchema = z.object({
  name: z.string().min(1, "Please enter your name"),
  email: z.string().min(1, "Please enter an email").email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function UserAuthForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const defaultValues = {
    name: "",
    email: "",
    password: "",
  };

  const form = useForm({
    resolver: zodResolver(isRegistering ? registerSchema : loginSchema),
    defaultValues,
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setError("");

    try {
      console.log('Attempting login with:', data);

      const response = await fetch("http://localhost:5001/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log('Server response:', result);

      if (response.ok) {
        try {
          // Xóa token cũ nếu có
          localStorage.removeItem('x-auth-token');
          
          // Lưu token mới
          localStorage.setItem('x-auth-token', result.token);
          console.log('Token saved to localStorage');

          // Gọi login từ AuthContext
          await login(result.token);
          console.log('Login successful');

          // Chuyển hướng sau khi đăng nhập thành công
          if (result.user.isAdmin) {
            router.push("/admin");
          } else {
            router.push("/user");
          }
        } catch (error) {
          console.error('Error during login process:', error);
          localStorage.removeItem('x-auth-token');
          setError(error.message || "Authentication failed. Please try again.");
        }
      } else {
        setError(result.message || "Login failed");
      }
    } catch (err) {
      console.error('Network or parsing error:', err);
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 dark:bg-red">
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full dark:w-full space-y-4 p-4 dark:p-4 border dark:border rounded-md shadow bg-white dark:bg-dark"
      >
        {isRegistering && (
          <div className="flex flex-col space-y-2">
            <label htmlFor="name" className="text-sm font-medium dark:text-white text-dark">
              Name
            </label>
            <input
              id="name"
              type="text"
              className="border rounded-md p-2 text-sm"
              placeholder="Enter your name..."
              disabled={loading}
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <span className="text-xs text-red-600">
                {form.formState.errors.name.message}
              </span>
            )}
          </div>
        )}

        <div className="flex flex-col space-y-2">
          <label htmlFor="email" className="text-sm font-medium dark:text-white text-dark">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="border rounded-md p-2 text-sm"
            placeholder="Enter your email..."
            disabled={loading}
            {...form.register("email")}
          />
          {form.formState.errors.email && (
            <span className="text-xs text-red-600">
              {form.formState.errors.email.message}
            </span>
          )}
        </div>

        <div className="flex flex-col space-y-2">
          <label htmlFor="password" className="text-sm font-medium dark:text-white text-dark">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="border rounded-md p-2 text-sm"
            placeholder="Enter your password..."
            disabled={loading}
            {...form.register("password")}
          />
          {form.formState.errors.password && (
            <span className="text-xs text-red-600">
              {form.formState.errors.password.message}
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-500 dark:bg-yellow-500 dark:text-dark text-white py-2 rounded-md"
        >
          {loading ? "Processing..." : (isRegistering ? "REGISTER" : "SIGN IN")}
        </button>

        {error && <p className="text-sm text-red-600 text-center">{error}</p>}
      </form>

      <div className="flex justify-center mt-4">
        <button
          onClick={() => setIsRegistering(!isRegistering)}
          className="text-sm text-gray-500 dark:text-white hover:underline"
        >
          {isRegistering ? "Already have an account? Sign In" : "Don't have an account? Register"}
        </button>
      </div>
    </div>
  );
}
