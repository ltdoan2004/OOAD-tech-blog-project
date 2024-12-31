"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const formSchema = z.object({
  email: z.string().min(1, "Please enter an email").email("Invalid email"),
  password: z.string().min(1, "Please enter a password"),
});

export default function UserAuthForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const defaultValues = {
    email: "",
    password: "",
  };

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = (data) => {
    const { email, password } = data;
    setLoading(true);
    if (email === "admin@gmail.com" && password === "Admin123@") {
      localStorage.setItem(
        "x-auth-token",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NjQwNmJhN2JkNGVjYzMwMmQyOThiN2YiLCJpc0FkbWluIjp0cnVlLCJpYXQiOjE3MTg3MDUwNzB9.ZKZbBONnV8QfA0Ofy4d2l1ke2hLZqFBy4pv7DKscGZA"
      );
      setLoading(false);
      router.push("/admin");
    } else {
      setError("Incorrect email or password.");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 dark:bg-red">
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full dark:w-full space-y-4 p-4 dark:p-4 border dark:border rounded-md shadow bg-white dark:bg-dark "
      >
        <div className="flex flex-col space-y-2">
          <label htmlFor="email" className="text-sm font-medium dark:text-white text-dark ">
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
          SIGN IN
        </button>
      </form>
      {error && (
        <p className="text-sm text-red-600 text-center">{error}</p>
      )}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-purple-500 dark:bg-yellow-500 dark:text-dark text-white px-2 text-gray-500 ">Or continue with</span>
        </div>
      </div>
    </div>
  );
}