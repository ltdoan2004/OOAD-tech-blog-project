'use client'
import { allBlogs } from "contentlayer/generated";
import React, { useState, useEffect } from 'react';
import BlogManager from "@/src/components/Admin/BlogManager";
import Link from 'next/link';
import { useAuth } from "@/src/context/AuthContext";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    // Sort blogs by date
    const sortedBlogs = [...allBlogs].sort((a, b) => 
      new Date(b.publishedAt) - new Date(a.publishedAt)
    );
    setBlogs(sortedBlogs);
  }, []);

  if (!user?.isAdmin) {
    router.push('/login');
    return null;
  }

  return (
    <main className="flex flex-col items-center justify-center p-5">
      <div className="w-full max-w-4xl mb-8">
        <Link 
          href="/admin/add-blog"
          className="inline-block px-6 py-2 bg-purple-600 dark:bg-yellow-500 text-white dark:text-black rounded hover:bg-purple-700 dark:hover:bg-yellow-600"
        >
          Add New Blog
        </Link>
      </div>
      <BlogManager blogs={blogs} />
    </main>
  );
}





