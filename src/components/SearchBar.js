'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // Change to next/navigation
import { slug } from "github-slugger";

const SearchBar = ({ blogs }) => { // Remove blogSlug prop since we don't need it
  const [query, setQuery] = useState('');
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const router = useRouter();

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    const filtered = blogs.filter(blog => 
      blog.title.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setFilteredBlogs(filtered);
  };

  const handleSearch = () => {
    if (onSearch) {
      onSearch(filteredBlogs);
    }
  };

  const handleRecommendationClick = (blog) => {
    router.push(blog.url); // Use the blog's URL directly from the blog object
  };

  return (
    <div className="search-bar flex flex-col justify-center items-center p-1 bg-purple-600 dark:bg-yellow-400 text-dark dark:text-light rounded-lg shadow-lg">
      <div className="flex">
        <input
          type="text"
          placeholder="Search..."
          value={query}
          onChange={handleInputChange}
          className="border-none px-5 py-3 rounded-l-lg w-[40rem] bg-dark dark:bg-light text-light dark:text-dark border-light/10 focus:ring-2 focus:ring-primary focus:outline-none placeholder-gray-400"
        />
        <button
          onClick={handleSearch}
          className="px-7 py-3 bg-purple-500 dark:bg-yellow-500 text-light hover:bg-orange-600 text-lg"
        >
          Search
        </button>
      </div>
      {query && filteredBlogs.length > 0 && (
        <div className="recommendations mt-2 bg-white rounded-lg shadow-lg w-[40rem] max-h-[400px] overflow-y-auto
            scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-gray-100
            [&::-webkit-scrollbar]:w-2
            [&::-webkit-scrollbar-track]:rounded-full
            [&::-webkit-scrollbar-track]:bg-gray-100
            [&::-webkit-scrollbar-thumb]:rounded-full
            [&::-webkit-scrollbar-thumb]:bg-purple-600
            scroll-smooth">
          {filteredBlogs.map(blog => (
            <div
              key={blog._id}
              className="p-4 border-b last:border-b-0 cursor-pointer hover:bg-gray-100"
              onClick={() => handleRecommendationClick(blog)}
            >
              <h3 className="text-lg font-semibold text-dark">{blog.title}</h3>
              <p className="text-gray-600 text-sm mt-1">{blog.description}</p>
              <div className="flex gap-2 mt-2">
                {blog.tags.map(tag => (
                  <span key={tag} className="text-xs text-purple-600">#{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;