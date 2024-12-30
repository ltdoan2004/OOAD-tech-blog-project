'use client';
import {allBlogs} from "contentlayer/generated";
import HomeCoverSection from "../components/Home/HomeCoverSection";
import FeaturedPosts from "../components/Home/FeaturedPosts";
import RecentPosts from "../components/Home/RecentPosts";
import SearchBar from "../components/SearchBar";
import React, { useState } from 'react';
export default function Home() {
  const [filteredBlogs, setFilteredBlogs] = useState(allBlogs);

  const handleSearch = (results) => {
    setFilteredBlogs(results);
  };
  return (
    <main className="flex flex-col items-center justify-center">
      <SearchBar blogs={allBlogs} onSearch={handleSearch}/>

      <HomeCoverSection blogs={allBlogs} />
      <FeaturedPosts blogs={allBlogs} />
      <RecentPosts blogs={allBlogs} />


    </main>
  )
}
