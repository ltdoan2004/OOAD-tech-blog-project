'use client'
import {allBlogs} from "contentlayer/generated";
import React, { useState } from 'react';
import RecentPostsAdmin from "@/src/components/Admin/RecentPostsAdmin";

export default function AdminPage() {
  
  const [blogs, setBlogs] = useState(allBlogs);

  // const handleAddBlog = () => {
  //   const newBlog = {
  //     title: `New Blog Post ${blogs.length + 1}`,
  //     slug: `new-blog-${blogs.length + 1}`,
  //     date: new Date().toISOString(),
  //     content: "This is a new blog post.",
  //   };

  //   setBlogs([...blogs, newBlog]);
  //   console.log("New blog added:", newBlog);
  //   alert('New blog added successfully!');
  // };

  return (
    <main className="flex flex-col items-center justify-center p-5">
      <RecentPostsAdmin blogs={blogs} />
    </main>
  );
}





