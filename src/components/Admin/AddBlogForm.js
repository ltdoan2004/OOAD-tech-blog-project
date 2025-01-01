"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function AddBlogForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [mdxContent, setMdxContent] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    tags: '',
    image: null,
    mdxFile: null
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleMdxFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, mdxFile: file }));
      const text = await file.text();
      setMdxContent(text);
      
      try {
        const frontmatterMatch = text.match(/^---\n([\s\S]*?)\n---/);
        if (frontmatterMatch) {
          const frontmatter = frontmatterMatch[1];
          const titleMatch = frontmatter.match(/title:\s*"([^"]+)"/);
          const descriptionMatch = frontmatter.match(/description:\s*"([^"]+)"/);
          const tagsMatch = frontmatter.match(/tags:\n([\s\S]*?)(\n---|\n\n)/);
          
          if (titleMatch) setFormData(prev => ({ ...prev, title: titleMatch[1] }));
          if (descriptionMatch) setFormData(prev => ({ ...prev, description: descriptionMatch[1] }));
          if (tagsMatch) {
            const tags = tagsMatch[1]
              .split('\n')
              .filter(line => line.trim().startsWith('-'))
              .map(tag => tag.replace('-', '').trim())
              .join(', ');
            setFormData(prev => ({ ...prev, tags }));
          }
        }
      } catch (error) {
        console.error('Error parsing frontmatter:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('content', mdxContent || formData.content);
      submitData.append('tags', formData.tags);
      if (formData.image) {
        submitData.append('image', formData.image);
      }

      const token = localStorage.getItem('x-auth-token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:5001/api/blogs', {
        method: 'POST',
        headers: {
          'x-auth-token': token
        },
        body: submitData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create blog post');
      }

      const result = await response.json();
      alert('Blog post created successfully!');
      router.push(`/blogs/${result.slug}`);
    } catch (error) {
      console.error('Error creating blog:', error);
      alert(error.message || 'Failed to create blog post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8 text-purple-600 dark:text-yellow-500">
        Create New Blog Post
      </h1>
      
      <div className="grid gap-6 bg-purple-50 dark:bg-yellow-50 p-6 rounded-lg shadow-md">
        {/* MDX File Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-purple-700 dark:text-yellow-700">
            Upload MDX File (Optional)
          </label>
          <input
            type="file"
            onChange={handleMdxFileChange}
            accept=".mdx"
            className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 
                     border-purple-300 dark:border-yellow-300 
                     focus:ring-2 focus:ring-purple-500 dark:focus:ring-yellow-500"
          />
        </div>

        {/* Title Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-purple-700 dark:text-yellow-700">
            Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800 
                     border-purple-300 dark:border-yellow-300 text-purple-900 dark:text-yellow-100
                     focus:ring-2 focus:ring-purple-500 dark:focus:ring-yellow-500"
            required
          />
        </div>

        {/* Description Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-purple-700 dark:text-yellow-700">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800 
                     border-purple-300 dark:border-yellow-300 text-purple-900 dark:text-yellow-100
                     focus:ring-2 focus:ring-purple-500 dark:focus:ring-yellow-500"
            rows={3}
            required
          />
        </div>

        {/* Content Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-purple-700 dark:text-yellow-700">
            Content (MDX)
          </label>
          <textarea
            value={mdxContent || formData.content}
            onChange={(e) => {
              setMdxContent(e.target.value);
              setFormData(prev => ({ ...prev, content: e.target.value }));
            }}
            className="w-full p-3 border rounded-lg font-mono bg-white dark:bg-gray-800 
                     border-purple-300 dark:border-yellow-300 text-purple-900 dark:text-yellow-100
                     focus:ring-2 focus:ring-purple-500 dark:focus:ring-yellow-500"
            rows={15}
            required
          />
        </div>

        {/* Tags Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-purple-700 dark:text-yellow-700">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
            className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800 
                     border-purple-300 dark:border-yellow-300 text-purple-900 dark:text-yellow-100
                     focus:ring-2 focus:ring-purple-500 dark:focus:ring-yellow-500"
            required
          />
        </div>

        {/* Image Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-purple-700 dark:text-yellow-700">
            Featured Image
          </label>
          <input
            type="file"
            onChange={handleImageChange}
            accept="image/*"
            className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 
                     border-purple-300 dark:border-yellow-300
                     focus:ring-2 focus:ring-purple-500 dark:focus:ring-yellow-500"
            required
          />
          {imagePreview && (
            <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded-lg border border-purple-300 dark:border-yellow-300">
              <Image
                src={imagePreview}
                alt="Preview"
                width={300}
                height={200}
                className="object-cover rounded-lg"
              />
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 text-white dark:text-black font-medium rounded-lg
                   bg-purple-600 dark:bg-yellow-500 
                   hover:bg-purple-700 dark:hover:bg-yellow-600 
                   disabled:opacity-50 transition-colors
                   focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:focus:ring-yellow-500"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating...
            </span>
          ) : (
            'Create Blog Post'
          )}
        </button>
      </div>
    </form>
  );
} 