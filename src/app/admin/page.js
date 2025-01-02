'use client';
import { allBlogs } from 'contentlayer/generated';
import React, { useState } from 'react';
import RecentPostsAdmin from '@/src/components/Admin/RecentPostsAdmin';
import SubscriberGraph from '@/src/components/Admin/SubscriberGraph';

export default function AdminPage() {
  const [blogs, setBlogs] = useState(allBlogs);

  return (
    <main className="w-full min-h-screen text-light dark:text-dark px-5 md:px-10 py-8 rounded-lg shadow-md">
      {/* Admin Dashboard Section */}
      <section className="w-full text-center flex flex-col items-center justify-center mb-16">
        <h1 className="text-3xl md:text-4xl font-bold text-dark dark:text-light mb-2">
          🛠️ Admin Dashboard
        </h1>
        <p className="text-lg md:text-xl text-dark dark:text-light max-w-2xl">
          Manage your blog, track subscriber growth, and review recent posts.
        </p>
      </section>

      {/* Subscriber Growth Section */}
      <section className="w-full mt-8 sm:mt-16 md:mt-24 px-5 sm:px-10 md:px-24 sxl:px-32">
        {/* Title Section */}
        <h2 className="font-bold capitalize text-2xl md:text-4xl text-dark dark:text-light mb-2 md:mb-0 px-4 md:px-0">
          Subscriber Growth
        </h2>

        {/* Graph Section */}
        <div className="w-full">
          <SubscriberGraph />
        </div>
      </section>

      {/* Recent Posts Section */}
      <section className="mt-12">
        <RecentPostsAdmin blogs={blogs} />
      </section>
    </main>
  );
}
