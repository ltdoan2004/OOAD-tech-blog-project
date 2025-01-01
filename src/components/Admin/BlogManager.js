"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function BlogManager({ blogs }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);

  // Get unique tags from all blogs
  const allTags = useMemo(() => {
    const tagSet = new Set();
    blogs.forEach(blog => {
      blog.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [blogs]);

  // Filter blogs based on title search and selected tags
  const filteredBlogs = useMemo(() => {
    return blogs.filter(blog => {
      // Search only by title
      const matchesSearch = searchQuery === '' || 
        blog.title.toLowerCase().includes(searchQuery.toLowerCase());

      // Filter by tags
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.every(tag => blog.tags.includes(tag));

      return matchesSearch && matchesTags;
    });
  }, [blogs, searchQuery, selectedTags]);

  const handleTagToggle = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
  };

  const handleDelete = async (slug) => {
    if (!confirm('Are you sure you want to delete this blog post?')) {
      return;
    }

    setLoading(true);
    setDeletingId(slug);

    try {
      const token = localStorage.getItem('x-auth-token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`http://localhost:5001/api/blogs/${slug}`, {
        method: 'DELETE',
        headers: {
          'x-auth-token': token
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete blog post');
      }

      alert('Blog post deleted successfully!');
      router.refresh();
    } catch (error) {
      console.error('Error deleting blog:', error);
      alert('Failed to delete blog post. Please try again.');
    } finally {
      setLoading(false);
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4 dark:text-yellow-600 text-purple-600">
        Manage Blog Posts
      </h2>

      {/* Search and Filter Section */}
      <div className="mb-6 space-y-4">
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search blogs by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 border rounded-lg dark:bg-gray-800 dark:text-white 
                     focus:ring-2 focus:ring-purple-600 dark:focus:ring-yellow-500"
          />
          {(searchQuery || selectedTags.length > 0) && (
            <button
              onClick={handleClearFilters}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              title="Clear all filters"
            >
              Clear
            </button>
          )}
        </div>

        {/* Tags Filter */}
        <div>
          <h3 className="text-sm font-medium mb-2 dark:text-yellow-600 text-purple-600 underline">
            Filter by tags:
          </h3>
          <div className="flex flex-wrap gap-2 border rounded">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => handleTagToggle(tag)}
                className={`px-3 py-1 rounded-full text-sm transition-colors
                  ${selectedTags.includes(tag)
                    ? 'bg-purple-600 dark:bg-yellow-500 text-white dark:text-black'
                    : 'bg-gray-200 dark:bg-gray-700 text-purple-700 dark:text-yellow-600 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <div className="text-sm text-purple-600 dark:text-yellow-600 ">
          {filteredBlogs.length === blogs.length ? (
            `All ${blogs.length} blogs`
          ) : (
            `Showing ${filteredBlogs.length} of ${blogs.length} blogs`
          )}
          {(searchQuery || selectedTags.length > 0) && (
            <span className="ml-2">
              (Filtered{searchQuery && ' by title'}{selectedTags.length > 0 && ' and tags'})
            </span>
          )}
        </div>
      </div>

      {/* Blog List */}
      <div className="grid gap-4">
        {filteredBlogs.length > 0 ? (
          filteredBlogs.map((blog) => (
            <div 
              key={blog._raw.flattenedPath} 
              className="flex items-center justify-between p-4 border rounded dark:border-gray-700 
                       dark:bg-gray-800 dark:bg-yellow-200 bg-purple-200"
            >
              <div className="flex items-center gap-4">
                {blog.image && (
                  <div className="w-24 h-16 relative">
                    <Image
                      src={blog.image.filePath.replace('../public', '')}
                      alt={blog.title}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                )}
                <div>
                  <h3 className="font-medium dark:text-dark text-dark">
                    {blog.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(blog.publishedAt).toLocaleDateString()}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {blog.tags.map(tag => (
                      <span
                        key={`${blog._raw.flattenedPath}-${tag}`}
                        className="text-xs px-2 py-1 rounded-full bg-purple-100 dark:bg-yellow-100 
                                 text-purple-600 dark:text-yellow-800"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Link
                  href={`/blogs/${blog._raw.flattenedPath}`}
                  className="px-3 py-1 text-sm bg-yellow-500 text-dark rounded hover:bg-orange-600"
                >
                  View
                </Link>
                <button
                  onClick={() => handleDelete(blog._raw.flattenedPath)}
                  disabled={loading && deletingId === blog._raw.flattenedPath}
                  className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 
                           disabled:opacity-50"
                >
                  {loading && deletingId === blog._raw.flattenedPath ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No blogs found matching your search criteria
          </div>
        )}
      </div>
    </div>
  );
} 