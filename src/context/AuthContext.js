"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("x-auth-token");
      if (token) {
        try {
          const decoded = jwtDecode(token);
          console.log("Decoded token:", decoded);
          setUser(decoded);
        } catch (error) {
          console.error("Token decode error:", error);
          localStorage.removeItem("x-auth-token");
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (token) => {
    try {
      if (!token) {
        throw new Error("No token provided");
      }

      // Log the raw token
      console.log('Raw token:', token);

      // Decode và kiểm tra token
      const decoded = jwtDecode(token);
      console.log('Decoded token:', decoded);

      // Kiểm tra các trường bắt buộc
      if (!decoded.id || !decoded.name || !decoded.email) {
        throw new Error("Invalid token structure");
      }

      // Kiểm tra thời hạn
      const currentTime = Date.now() / 1000;
      if (decoded.exp && decoded.exp < currentTime) {
        throw new Error("Token has expired");
      }

      // Lưu token và cập nhật user state
      localStorage.setItem("x-auth-token", token);
      setUser({
        id: decoded.id,
        name: decoded.name,
        email: decoded.email,
        isAdmin: decoded.isAdmin
      });
      console.log('User state updated:', decoded);

    } catch (error) {
      console.error('Login error:', error);
      localStorage.removeItem("x-auth-token");
      throw new Error(error.message || "Invalid token");
    }
  };

  const logout = () => {
    localStorage.removeItem("x-auth-token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {loading ? <div>Loading...</div> : children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}