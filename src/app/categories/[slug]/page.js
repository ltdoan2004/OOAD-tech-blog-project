import React from 'react'
import { allBlogs } from '@/.contentlayer/generated'

export default function CategoryPage({ params }) {
    const { slug } = params
    const filteredBlogs = allBlogs.filter((blog) => 
        blog.tags.some(tag => tag.toLowerCase() === slug.toLowerCase())
    )

    return (
        <article className="mt-12 flex flex-col text-dark">
            <div className="px-32">
                <h1 className="text-4xl font-bold">#{slug}</h1>
                <div className="grid grid-cols-3 gap-16 mt-24">
                    {/* You can map through filteredBlogs here to display them */}
                    {filteredBlogs.map((blog) => (
                        <div key={blog._id}>
                            {/* Add your blog card component here */}
                            {blog.title}
                        </div>
                    ))}
                </div>
            </div>
        </article>
    )
} 