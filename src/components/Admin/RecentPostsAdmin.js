'use client'
import { sortBlogs } from "@/src/utils";
import Link from "next/link";
import React from "react";
import BlogLayoutThree from "../Blog/BlogLayoutThree";


const RecentPostsAdmin = ({ blogs }) => {
  const sortedBlogs = sortBlogs(blogs);

  return (
    <section className="w-full mt-16 sm:mt-24 md:mt-32 px-5 sm:px-10 md:px-24 sxl:px-32 flex flex-col items-center justify-center">
      {/* Header Section */}
      <div className="w-full flex flex-col md:flex-row justify-between items-center mb-8 gap-4 md:gap-0">
        <h2 className="w-fit inline-block font-bold capitalize text-2xl md:text-4xl text-dark dark:text-light">
          All posts
        </h2>
        
        <div className="flex items-center gap-4">
          {/* View All Button Styled Link */}
          <Link
            href="/categories/all"
            className="
              inline-block px-6 py-2 font-medium text-base md:text-lg text-light bg-dark dark:text-dark dark:bg-light 
              border-2 border-solid border-dark dark:border-light 
              rounded-md hover:scale-105 transition-all ease-in-out duration-200
            "
          >
            View All
          </Link>

          {/* Add Blog Button */}
          <button
            
            className="
              inline-block px-6 py-2 font-medium text-base md:text-lg text-light bg-dark dark:text-dark dark:bg-light 
              border-2 border-solid border-dark dark:border-light 
              rounded-md hover:scale-105 transition-all ease-in-out duration-200
            "
          >
             Add New Blog
          </button>
        </div>
      </div>

      {/* Blog Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 grid-rows-2 gap-8 sm:gap-12 mt-8 sm:mt-12">
        {sortedBlogs.slice(4, 10).map((blog, index) => (
          <article key={index} className="col-span-1 row-span-1 relative">
            <BlogLayoutThree blog={blog} />
          </article>
        ))}
      </div>
    </section>
  );
};

export default RecentPostsAdmin;
