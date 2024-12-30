"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const LoginComponent = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter(); // Ensure useRouter is used within the component

  const handleLogin = async () => { // Use async/await for potential asynchronous operations
    if (email === "admin" && password === "admin") {
      alert("Login successfully");
      try {
        await router.push('/admin'); // Redirect using router.push
      } catch (error) {
        console.error('Error during navigation:', error);
        alert('An error occurred during redirection. Please try again.'); // Inform user about the error
      }
    } else {
      alert("Login failed");
    }
  };

  return (
    <section className="flex justify-center items-center min-h-screen bg-gray-200">
      <div className="login-box bg-white p-6 rounded-lg shadow-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold">Login</h1>
        </div>
        <div className="mb-4">
          <input
            type="text"
            className="w-full p-3 border rounded-md focus:outline-none focus:border-blue-500"
            placeholder="Email"
            autoComplete="off"
            id="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <input
            type="password"
            className="w-full p-3 border rounded-md focus:outline-none focus:border-blue-500"
            placeholder="Password"
            autoComplete="off"
            id="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="flex justify-between items-center mb-4">
          <label className="flex items-center">
            <input type="checkbox" id="remember" className="mr-2" />
            Remember me
          </label>
          <a href="#" className="text-sm text-blue-500 hover:underline">
            Forgot password
          </a>
        </div>
        <button
          type="button"
          className="w-full bg-blue-500 text-white p-3 rounded-md hover:bg-blue-600"
          onClick={handleLogin}
        >
          Sign In
        </button>
        <div className="mt-4 text-center">
          <p>
            Don't have an account?{" "}
            <a href="#" className="text-blue-500 hover:underline">
              Sign Up
            </a>
          </p>
        </div>
      </div>
    </section>

  );
};

export default LoginComponent;
