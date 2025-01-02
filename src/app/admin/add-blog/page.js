"use client";

import AddBlogForm from "@/src/components/Admin/AddBlogForm";
import { useAuth } from "@/src/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AddBlogPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user?.isAdmin) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user?.isAdmin) {
    return null;
  }

  return (
    <main className="min-h-screen py-8">
      <AddBlogForm />
    </main>
  );
} 